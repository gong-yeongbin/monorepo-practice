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
}
