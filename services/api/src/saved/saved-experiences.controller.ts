import { Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { SavedExperienceSummary } from '@irife/contracts';
import { AccessTokenGuard } from '../identity/access-token.guard.js';
import { CurrentUser } from '../identity/current-user.decorator.js';
import type { AuthenticatedUser } from '../identity/identity.types.js';
import { SavedExperiencesService } from './saved-experiences.service.js';

@ApiTags('saved experiences')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('me/saved-experiences')
export class SavedExperiencesController {
  constructor(private readonly saved: SavedExperiencesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser): Promise<SavedExperienceSummary[]> {
    return this.saved.listMine(user.id);
  }

  @Post(':experienceId')
  save(
    @CurrentUser() user: AuthenticatedUser,
    @Param('experienceId', new ParseUUIDPipe()) experienceId: string,
  ): Promise<SavedExperienceSummary> {
    return this.saved.save(user.id, experienceId);
  }

  @Delete(':experienceId')
  @HttpCode(204)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('experienceId', new ParseUUIDPipe()) experienceId: string,
  ): Promise<void> {
    await this.saved.remove(user.id, experienceId);
  }
}
