// Prisma로 user를 조회·생성·수정·삭제하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { User, UserWithPassword } from '@user/domain/user.entity';
import { CreateUserProps, FindAllUserFilter, UpdateUserProps, UserRepository } from '@user/domain/user.repository';

// 허용 목록은 조인 테이블이라 domain User의 advertising_ids로 평탄화해야 한다(그래서 이 모듈만 예외적으로 row를 매핑한다)
const ADVERTISING_INCLUDE = { user_advertising: { select: { advertising_id: true } } } as const;

@Injectable()
export class PrismaUserRepository implements UserRepository {
	constructor(private readonly prismaService: PrismaService) {}

	// 조회·수정 결과는 password를 omit해 반환한다(도메인 User 타입에 없고 API 응답에 해시가 노출되면 안 됨)
	// approved가 undefined면 Prisma가 조건을 무시하므로 필터 유무를 분기하지 않는다
	async findAll(filter?: FindAllUserFilter): Promise<User[]> {
		const rows = await this.prismaService.user.findMany({ where: { approved: filter?.approved }, omit: { password: true }, include: ADVERTISING_INCLUDE });
		return rows.map(toUser);
	}

	async findById(id: number): Promise<User | null> {
		const row = await this.prismaService.user.findUnique({ where: { id }, omit: { password: true }, include: ADVERTISING_INCLUDE });
		return row && toUser(row);
	}

	async findByEmail(email: string): Promise<User | null> {
		const row = await this.prismaService.user.findUnique({ where: { email }, omit: { password: true }, include: ADVERTISING_INCLUDE });
		return row && toUser(row);
	}

	// signin 비밀번호 검증 전용 — 유일하게 password를 포함해 반환한다
	async findByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
		const row = await this.prismaService.user.findUnique({ where: { email }, include: ADVERTISING_INCLUDE });
		return row && toUser(row);
	}

	async create(props: CreateUserProps): Promise<void> {
		await this.prismaService.user.create({ data: props });
	}

	async update(id: number, props: UpdateUserProps): Promise<User> {
		const { advertising_ids, ...scalars } = props;
		const row = await this.prismaService.user.update({
			where: { id },
			// user_advertising은 명시적 조인 모델이라 relation set이 없다. 같은 update의 중첩 쓰기에서
			// deleteMany(전건 삭제) → create(재삽입) 순으로 통째 교체한다(Prisma가 delete를 create보다 먼저 실행하고 전체가 한 트랜잭션이다).
			// advertising_ids가 undefined면 키 자체가 빠져 허용 목록을 건드리지 않고, []면 전건 삭제만 남는다.
			data: {
				...scalars,
				...(advertising_ids && {
					user_advertising: { deleteMany: {}, create: advertising_ids.map((advertising_id) => ({ advertising_id })) },
				}),
			},
			omit: { password: true },
			include: ADVERTISING_INCLUDE,
		});
		return toUser(row);
	}

	// password는 이미 해시된 값을 받는다(해싱은 use-case 책임)
	async updatePassword(id: number, password: string): Promise<void> {
		await this.prismaService.user.update({ where: { id }, data: { password } });
	}

	async delete(id: number): Promise<void> {
		await this.prismaService.user.delete({ where: { id } });
	}

	async countAdvertising(advertising_ids: number[]): Promise<number> {
		return this.prismaService.advertising.count({ where: { id: { in: advertising_ids } } });
	}
}

// user_advertising 조인 행을 domain User의 advertising_ids로 평탄화한다
function toUser<T extends { user_advertising: { advertising_id: number }[] }>(row: T): Omit<T, 'user_advertising'> & { advertising_ids: number[] } {
	const { user_advertising, ...rest } = row;
	return { ...rest, advertising_ids: user_advertising.map((link) => link.advertising_id) };
}
