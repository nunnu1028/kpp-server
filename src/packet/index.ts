export class PacketParser {
	public static packetMap = new Map<number, Map<number, (packet: Buffer) => unknown>>();

	public static parse(packet: Buffer): unknown {
		throw new Error("Not implemented");
	}

	public static decodePacket<T>(mid: number, sid: number, packet: Buffer): T | null {
		const packetMap = PacketParser.packetMap.get(mid);
		if (!packetMap) return null;

		const parser = packetMap.get(sid);
		if (!parser) return null;

		return parser(packet) as T;
	}
}
