import { PacketParser } from "..";

export interface GDMSLoginPacketReq {
	reserved1: number;
	loginType: string;
	reserved2: number;
	reserved3: string;
	reserved4: string;
	token: string;
}

export interface GDMSLoginPacketRes {
	privateKey: Buffer;
	sessionKey: string;
}

export class GDMSLoginParser extends PacketParser {
	public static parse(packet: Buffer): GDMSLoginPacketReq {
		const view = new DataView(packet.buffer);

		return {
			reserved1: view.getUint16(0, true),
			loginType: packet.slice(2, 6).toString().replace(/\0/g, ""),
			reserved2: view.getUint16(6, true),
			reserved3: packet.slice(8, 24).toString().replace(/\0/g, ""),
			reserved4: packet.slice(24, 40).toString().replace(/\0/g, ""),
			token: packet.slice(40, 168).toString().replace(/\0/g, "")
		};
	}

	public static create(packet: GDMSLoginPacketRes): Buffer {
		const buffer = Buffer.alloc(32);

		buffer.set(packet.privateKey, 0);
		buffer.write(packet.sessionKey, 24);

		return buffer;
	}
}
