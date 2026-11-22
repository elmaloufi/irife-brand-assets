import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module.js';
import { SavedExperiencesController } from './saved-experiences.controller.js';
import { SavedExperiencesService } from './saved-experiences.service.js';
@Module({
  imports: [IdentityModule],
  controllers: [SavedExperiencesController],
  providers: [SavedExperiencesService],
})
export class SavedExperiencesModule {}
