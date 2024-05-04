import { PacketParser } from "..";

export interface GDMSCharInfoReq {
	sessionKey: string;
}

export interface GDMSCharInfoRes {
	sessionKey: string;
	nickname: string;
	reserved_str: string;
	some_time: number;
}

export class GDMSCharInfoParser extends PacketParser {
	public static parse(packet: Buffer): GDMSCharInfoReq {
		return { sessionKey: packet.slice(0, 8).toString().replace(/\0/g, "") };
	}

	public static create(packet: GDMSCharInfoRes): Buffer {
		const buffer = Buffer.alloc(280);

		for (let i = 0; i < buffer.length; i++) buffer[i] = 1;

		buffer.write(packet.sessionKey, 0);
		buffer.write(packet.nickname, 8);
		buffer.write(packet.reserved_str, 36);
		buffer.writeUInt32LE(packet.some_time, 272);

		return buffer;
	}
}
