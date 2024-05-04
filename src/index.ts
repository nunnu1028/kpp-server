import * as net from "net";
import { CryptoManager, PacketManager } from "./network";
import { PacketParser } from "./packet";
import { GDMSCharInfoParser, GDMSCreateCharacterParser, GDMSLoginParser } from "./packet/gdms";
let i = 0;
interface KeroroPangPangPacket {
	packetID: number;
	sid: number;
	mid: number;
	header: Buffer;
	packet_header: Buffer;
	packet_data: Buffer;
}

net.createServer((socket) => {
	let globalBuffer = Buffer.allocUnsafe(0);
	let globalPacketLength = -1;
	const cryptoManager = new CryptoManager();

	const _100Map = new Map<number, (packet: Buffer) => unknown>();
	_100Map.set(0x11, GDMSLoginParser.parse);

	PacketParser.packetMap.set(0x100, _100Map);

	const performPacket = (data: Buffer) => {
		globalBuffer = Buffer.concat([globalBuffer, data]);
		if (globalPacketLength < 0 && globalBuffer.length >= 56) globalPacketLength = CryptoManager.decrypt_header(globalBuffer).readUInt16LE(24);
		if (globalBuffer.length <= 0 || globalBuffer.length < globalPacketLength) return;

		const decrypted_data = cryptoManager.crypt(globalBuffer.slice(32, globalPacketLength));

		const sid = decrypted_data.readUInt16LE(0);
		const mid = decrypted_data.readUInt16LE(2);
		const packetID = decrypted_data.readUInt16LE(4);

		const kppPacket: KeroroPangPangPacket = {
			packetID,
			sid,
			mid,
			header: data.slice(0, 32),
			packet_header: decrypted_data.slice(0, 24),
			packet_data: decrypted_data.slice(24)
		};

		console.log("sid: %d, mid: %d, packetID: %d", kppPacket.sid, kppPacket.mid, kppPacket.packetID);
		console.log(
			Array.from(kppPacket.packet_data)
				.map((x) => x.toString(16))
				.join(" ")
		);

		if (kppPacket.sid === 0x100) {
			if (kppPacket.mid === 0x11) {
				const req = PacketParser.decodePacket(kppPacket.sid, kppPacket.mid, kppPacket.packet_data);
				if (!req) return console.log(req);

				console.log(req);

				const res = GDMSLoginParser.create({
					privateKey: cryptoManager.private_key.subarray(),
					sessionKey: "12345678"
				});

				const header = PacketManager.create_header(res.length + 56, 1, 1);
				const packet_header = PacketManager.create_packet_header(kppPacket.sid, kppPacket.mid + 1, 0, kppPacket.packetID);
				const packet = PacketManager.create_packet(header, packet_header, res, cryptoManager);

				socket.write(packet);
			} else if (kppPacket.mid === 0x91) {
				const res = GDMSCharInfoParser.create({
					sessionKey: i++ === 0 ? "" : "12345678",
					nickname: "test",
					reserved_str: "12345678",
					some_time: 0
				});
				const req = GDMSCharInfoParser.parse(kppPacket.packet_data);
				console.log(req);

				const header = PacketManager.create_header(res.length + 56, 1, 1);
				const packet_header = PacketManager.create_packet_header(kppPacket.sid, kppPacket.mid + 1, 0, kppPacket.packetID);
				const packet = PacketManager.create_packet(header, packet_header, res, cryptoManager);

				socket.write(packet);
			} else if (kppPacket.mid === 0x93) {
				const req = GDMSCreateCharacterParser.parse(kppPacket.packet_data);
				console.log(req);

				const res = GDMSCreateCharacterParser.create({
					sessionKey: "12345678",
					reserved3: 2,
					reserved4: 3,
					reserved5: "12345678",
					reserved6: 4,
					reserved7: 5
				});

				const header = PacketManager.create_header(res.length + 56, 1, 1);
				const packet_header = PacketManager.create_packet_header(kppPacket.sid, kppPacket.mid + 1, 0, kppPacket.packetID);
				const packet = PacketManager.create_packet(header, packet_header, res, cryptoManager);

				socket.write(packet);
			} else if (kppPacket.mid === 0x61) {
				const buffer = Buffer.allocUnsafe(68);
				for (let i = 0; i < buffer.length; i++) buffer[i] = 0;
				buffer.writeUInt32LE(2, 0);
				buffer.writeUInt32LE(0, 4);
				buffer.writeUInt32LE(1, 8); // 서버 이름
				buffer.writeUInt32LE(1, 16); // 서버 혼잡도???
				buffer.writeUInt32LE(0, 20); // ??

				// One Server Data Size = 32

				buffer.writeUInt32LE(2, 40); // 서버 이름
				buffer.writeUInt32LE(1, 44); // 서버 혼잡도???
				buffer.writeUInt32LE(2, 48); // ??

				const header = PacketManager.create_header(buffer.length + 56, 1, 1);
				const packet_header = PacketManager.create_packet_header(kppPacket.sid, kppPacket.mid + 1, 0, kppPacket.packetID);
				const packet = PacketManager.create_packet(header, packet_header, buffer, cryptoManager);

				socket.write(packet);
			} else if (kppPacket.mid === 0x71) {
				const data = Buffer.allocUnsafe(528);
				for (let i = 0; i < data.length; i++) data[i] = 0;
				data.writeUInt32LE(kppPacket.packet_data.readUInt32LE(0), 0); // server id
				data.writeUInt32LE(0, 4);
				data.writeUInt32LE(3, 8); // channel no?
				data.writeUInt32LE(0, 12); // ???? 1이면 오류
				data.writeUInt32LE(1, 16); // channel 입장가능 여부?
				data.writeUInt32LE(4, 20); // channel type?
				data.writeUInt32LE(1, 24); // channel 혼잡도?

				data.writeUInt32LE(2, 72); // channel no?
				data.writeUInt32LE(0, 76); // ???? 1이면 오류
				data.writeUInt32LE(1, 80); // channel 입장가능 여부?
				data.writeUInt32LE(4, 84); // channel type?
				data.writeUInt32LE(1, 88); // channel 혼잡도?

				data.writeUInt32LE(3, 136); // channel no?
				data.writeUInt32LE(1, 140); // ???? 1이면 오류
				data.writeUInt32LE(1, 144); // channel 입장가능 여부?
				data.writeUInt32LE(8, 148); // channel type?
				data.writeUInt32LE(1, 152); // channel 혼잡도?

				const header = PacketManager.create_header(data.length + 56, 1, 1);
				const packet_header = PacketManager.create_packet_header(kppPacket.sid, kppPacket.mid + 1, 0, kppPacket.packetID);
				const packet = PacketManager.create_packet(header, packet_header, data, cryptoManager);

				socket.write(packet);
			} else if (kppPacket.mid === 0x81) {
				const data = Buffer.allocUnsafe(16);
				data.writeUInt32LE(1, 0); // server
				data.writeUInt32LE(1, 4); // id
				data.writeUInt32LE(2130706433, 8); // ip to integer
				data.writeUInt16LE(57, 12);
				data.writeUInt16LE(18608, 12);

				const header = PacketManager.create_header(data.length + 56, 1, 1);
				const packet_header = PacketManager.create_packet_header(kppPacket.sid, kppPacket.mid + 1, 0, kppPacket.packetID);
				const packet = PacketManager.create_packet(header, packet_header, data, cryptoManager);

				socket.write(packet);
			} else {
				console.log("Unknown Packet:", kppPacket);

				const data = Buffer.allocUnsafe(128);

				const header = PacketManager.create_header(data.length + 56, 1, 1);
				const packet_header = PacketManager.create_packet_header(kppPacket.sid, kppPacket.mid + 1, 0, kppPacket.packetID);
				const packet = PacketManager.create_packet(header, packet_header, data, cryptoManager);

				socket.write(packet);
			}
		} else if (kppPacket.sid === 0x20) {
			if (kppPacket.mid === 0x11) {
				const data = Buffer.allocUnsafe(40);
				for (let i = 0; i < data.length; i++) data[i] = i;
				data.set(cryptoManager.private_key.subarray(), 0);

				const someData = Buffer.allocUnsafe(8); // maybe session key
				for (let i = 0; i < someData.length; i++) someData[i] = i;
				data.set(Buffer.from("12345678"), 24);

				const header = PacketManager.create_header(data.length + 56, 1, 1);
				const packet_header = PacketManager.create_packet_header(kppPacket.sid, kppPacket.mid + 1, 0, kppPacket.packetID);
				const packet = PacketManager.create_packet(header, packet_header, data, cryptoManager);

				socket.write(packet);
			} else {
				console.log("Unknown Packet:", kppPacket);

				const data = Buffer.allocUnsafe(128);

				const header = PacketManager.create_header(data.length + 56, 1, 1);
				const packet_header = PacketManager.create_packet_header(kppPacket.sid, kppPacket.mid + 1, 0, kppPacket.packetID);
				const packet = PacketManager.create_packet(header, packet_header, data, cryptoManager);

				socket.write(packet);
			}
		} else if (kppPacket.sid === 0x200) {
			if (kppPacket.mid === 0x17) {
				const data = Buffer.allocUnsafe(0);

				const header = PacketManager.create_header(data.length + 56, 1, 1);
				const packet_header = PacketManager.create_packet_header(kppPacket.sid, kppPacket.mid + 1, 0, kppPacket.packetID);
				const packet = PacketManager.create_packet(header, packet_header, data, cryptoManager);

				socket.write(packet);
			} else {
				console.log("Unknown Packet:", kppPacket);

				const data = Buffer.allocUnsafe(128);

				const header = PacketManager.create_header(data.length + 56, 1, 1);
				const packet_header = PacketManager.create_packet_header(kppPacket.sid, kppPacket.mid + 1, 0, kppPacket.packetID);
				const packet = PacketManager.create_packet(header, packet_header, data, cryptoManager);

				socket.write(packet);
			}
		} else {
			console.log("Unknown Packet:", kppPacket);

			const data = Buffer.allocUnsafe(128);

			const header = PacketManager.create_header(data.length + 56, 1, 1);
			const packet_header = PacketManager.create_packet_header(kppPacket.sid, kppPacket.mid + 1, 0, kppPacket.packetID);
			const packet = PacketManager.create_packet(header, packet_header, data, cryptoManager);

			socket.write(packet);
		}

		const slicedPacket = globalBuffer.slice(globalPacketLength);
		globalBuffer = Buffer.allocUnsafe(0);
		globalPacketLength = -1;

		performPacket(slicedPacket);
	};

	socket.on("error", console.log);
	socket.on("data", performPacket.bind(this));

	console.log("Client connected");
}).listen(18608, "0.0.0.0");

console.log("Server started");
