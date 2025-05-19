import SQLite from 'react-native-sqlite-storage';
import { CellTowerInfo } from '../types/CellInfo';

export interface CellTowerLocation {
    latitude: number;
    longitude: number;
    accuracy: number;
}

class DatabaseHelper {
    private db: SQLite.SQLiteDatabase | null = null;

    async init(): Promise<void> {
        try {
            this.db = await SQLite.openDatabase({
                name: 'celltowers.db',
                location: 'default',
                createFromLocation: 1, // Pre-bundled database
            });
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    async findLocation(cellInfo: CellTowerInfo): Promise<CellTowerLocation | null> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        try {
            const [result] = await this.db.executeSql(
                `SELECT latitude, longitude, accuracy 
                 FROM cell_towers 
                 WHERE cell_id = ? AND lac = ? AND mcc = ? AND mnc = ?
                 LIMIT 1`,
                [cellInfo.cellId, cellInfo.lac, cellInfo.mcc, cellInfo.mnc]
            );

            if (result.rows.length > 0) {
                return result.rows.item(0) as CellTowerLocation;
            }
            return null;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    async close(): Promise<void> {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }
}

export default new DatabaseHelper(); 