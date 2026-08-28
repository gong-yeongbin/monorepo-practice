// Prisma로 예약을 생성·조회·삭제하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Reservation, ReservationListRow } from '@reservation/domain/reservation.entity';
import { CreateReservationProps, ReservationRepository } from '@reservation/domain/reservation.repository';

@Injectable()
export class PrismaReservationRepository implements ReservationRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async createMany(props: CreateReservationProps[]): Promise<void> {
		await this.prismaService.reservation.createMany({ data: props });
	}

	// 예약은 campaign에 걸리므로 advertising 단위 조회는 관계 필터로 건넌다. 대상 campaign명·media명을 평탄화해 반환한다
	async findByAdvertisingId(advertising_id: number): Promise<ReservationListRow[]> {
		const rows = await this.prismaService.reservation.findMany({
			where: { campaign: { advertising_id } },
			orderBy: { reserved_at: 'desc' },
			include: { campaign: { select: { name: true, media: { select: { name: true } } } } },
		});

		return rows.map(({ campaign, ...reservation }) => ({ ...reservation, campaign_name: campaign.name, media_name: campaign.media.name }));
	}

	async findById(id: number): Promise<Reservation | null> {
		return this.prismaService.reservation.findUnique({ where: { id } });
	}

	async delete(id: number): Promise<void> {
		await this.prismaService.reservation.delete({ where: { id } });
	}

	async countCampaigns(campaign_ids: number[]): Promise<number> {
		return this.prismaService.campaign.count({ where: { id: { in: campaign_ids } } });
	}

	// 스케줄러용 — 미적용이고 예약 시각이 지난 예약 (서버 다운 중 지난 건도 걸려 소급 적용된다).
	// 한 캠페인에 밀린 예약이 여러 건이면 나중 예약이 최종 값이어야 하므로 예약 시각 오름차순으로 돌려준다
	// (use-case가 이 순서대로 하나씩 적용한다).
	async findDue(now: Date): Promise<Reservation[]> {
		return this.prismaService.reservation.findMany({ where: { is_applied: false, reserved_at: { lte: now } }, orderBy: { reserved_at: 'asc' } });
	}

	// 예약 적용 — campaign 갱신과 완료 처리를 한 트랜잭션으로 묶는다.
	// campaign이 삭제되면 예약도 FK CASCADE로 함께 지워지므로 대상 없음 케이스는 없다.
	async apply(reservation: Reservation): Promise<void> {
		await this.prismaService.$transaction([
			this.prismaService.campaign.update({
				where: { id: reservation.campaign_id },
				data: { name: reservation.name, tracker_tracking_url: reservation.tracking_url },
			}),
			this.prismaService.reservation.update({ where: { id: reservation.id }, data: { is_applied: true } }),
		]);
	}
}
