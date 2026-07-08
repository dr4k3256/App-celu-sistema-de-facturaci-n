import { IBackupRepository } from '../../domain/ports';

export const createBackupUseCases = (repository: IBackupRepository) => {
    return {
        exportBackup: async () => {
            return await repository.exportData();
        },
        importBackup: async (data: string) => {
            await repository.importData(data);
        }
    };
};
