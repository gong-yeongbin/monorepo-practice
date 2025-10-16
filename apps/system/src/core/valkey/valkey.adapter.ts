import { Injectable } from '@nestjs/common';
import { ValkeyService } from './valkey.service';

@Injectable()
export class ValkeyAdapter implements ValkeyService {}
