import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CookieAuthGuard extends AuthGuard('secure-cookie') {}
