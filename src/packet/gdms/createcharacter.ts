import { PacketParser } from "..";

export interface GDMSCreateCharacterReq {
	sessionKey: string;
    nickname: string;
    characterType: number;
}

export interface GDMSCreateCharacterRes {
	sessionKey: string;
    reserved3: number;
    reserved4: number;
    reserved5: string;
    reserved6: number;
    reserved7: number;
}

export class GDMSCreateCharacterParser extends PacketParser {
	public static parse(packet: Buffer): GDMSCreateCharacterReq {
        return { 
            sessionKey: packet.slice(0, 8).toString().replace(/\0/g, ""),
            nickname: packet.slice(16, 28).toString().replace(/\0/g, ""),
            characterType: packet.readUInt8(50) 
        }
	}

	public static create(packet: GDMSCreateCharacterRes): Buffer {
		const buffer = Buffer.alloc(52);

        buffer.write(packet.sessionKey, 0);

        buffer.writeUInt32LE(packet.reserved3, 8);
        buffer.writeUInt32LE(packet.reserved4, 12);

        buffer.write(packet.reserved5, 16);

        buffer.writeUInt32LE(packet.reserved6, 44);
        buffer.writeUInt32LE(packet.reserved7, 48);

		return buffer;
	}
}
