const BIG_ENDIAN = 0;
const LITTLE_ENDIAN = 1;

class RandomAccessFile {
    /**
     * Store an ArrayBuffer and add functionality for random access
     * Unless otherwise noted all read functions advance the file's pointer by the length of the data read
     *
     * @param {ArrayBuffer|string} file An ArrayBuffer or string to load for random access
     * @param {number} endian Endianess of the file constants BIG_ENDIAN and LITTLE_ENDIAN are provided
     */
    constructor(file, endian = BIG_ENDIAN) {
		// https://stackoverflow.com/a/18002694/18758797
		if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
			this.offset = 0;
			this.buffer = null;

			// set the binary endian order
			if (endian < 0) return;
			this.bigEndian = (endian === BIG_ENDIAN);

			// string to ArrayBuffer if string was provided
			if (typeof file === 'string') {
				const encoder = new TextEncoder();
				this.buffer = encoder.encode(file).buffer;
			} else {
				// load the ArrayBuffer directly
				this.buffer = file;
			}

			// set up local read functions so we don't constantly query endianess
			this.readFloatLocal = (offset) => {
				const result = this.bigEndian ?
					new DataView(this.buffer.buffer, offset, 4).getFloat32(0, false) :
					new DataView(this.buffer.buffer, offset, 4).getFloat32(0, true);
				this.offset += 4;
				return result;
			};

			this.readIntLocal = (offset, byteLength) => {
				const result = this.bigEndian ?
					new DataView(this.buffer.buffer, offset, byteLength).getUint32(0, false) :
					new DataView(this.buffer.buffer, offset, byteLength).getUint32(0, true);
				this.offset += byteLength;
				return result;
			};

			this.readSignedIntLocal = (offset, byteLength) => {
				const result = this.bigEndian ?
					new DataView(this.buffer.buffer, offset, byteLength).getInt32(0, false) :
					new DataView(this.buffer.buffer, offset, byteLength).getInt32(0, true);
				this.offset += byteLength;
				return result;
			};
		} else {
			this.offset = 0;
			this.buffer = null;

			// set the binary endian order
			if (endian < 0) return;
			this.bigEndian = (endian === BIG_ENDIAN);

			// string to buffer if string was provided
			if (typeof file === 'string') {
				this.buffer = Buffer.from(file, 'binary');
			} else {
				// load the buffer directly
				this.buffer = file;
			}

			// set up local read functions so we don't constantly query endianess
			if (this.bigEndian) {
				this.readFloatLocal = this.buffer.readFloatBE.bind(this.buffer);
				this.readIntLocal = this.buffer.readUIntBE.bind(this.buffer);
				this.readSignedIntLocal = this.buffer.readIntBE.bind(this.buffer);
			}	else {
				this.readFloatLocal = this.buffer.readFloatLE.bind(this.buffer);
				this.readIntLocal = this.buffer.readUIntLE.bind(this.buffer);
				this.readSignedIntLocal = this.buffer.readIntLE.bind(this.buffer);
			}
		}
    }

	/**
	 * Get buffer length
	 *
	 * @category Positioning
	 * @returns {number}
	 */
	getLength() {
		return this.buffer.length;
	}

	/**
	 * Get current position in the file
	 *
	 * @category Positioning
	 * @returns {number}
	 */
	getPos() {
		return this.offset;
	}

	/**
	 * Seek to a provided buffer offset
	 *
	 * @category Positioning
	 * @param {number} position Byte offset
	 */
	seek(position) {
		this.offset = position;
	}

	/**
	 * Read data without advancing the offset
	 *
	 * @category Positioning
	 * @param {number} position Byte offset
	 */
	peek(position) {
		var origOffset = this.offset;
        var peekedData = this.read(position);
        this.offset = origOffset;
        return peekedData;
	}

	/**
	 * Read a string of a specificed length from the buffer
	 *
	 * @category Data
	 * @param {number} length Length of string to read
	 * @returns {string}
	 */
	readString(length) {
		const data = this.buffer.toString('utf-8', this.offset, (this.offset += length));

		return data;
	}

	/**
	 * Read a float from the buffer
	 *
	 * @category Data
	 * @returns {number}
	 */
	readFloat() {
		const float = this.readFloatLocal(this.offset);
		this.offset += 4;

		return float;
	}

	/**
	 * Read a 4-byte unsigned integer from the buffer
	 *
	 * @category Data
	 * @returns {number}
	 */
	readInt() {
		const int = this.readIntLocal(this.offset, 4);
		this.offset += 4;

		return int;
	}

	/**
	 * Read a 2-byte unsigned integer from the buffer
	 *
	 * @category Data
	 * @returns {number}
	 */
	readShort() {
		const short = this.readIntLocal(this.offset, 2);
		this.offset += 2;

		return short;
	}

	/**
	 * Read a 2-byte signed integer from the buffer
	 *
	 * @category Data
	 * @returns {number}
	 */
	readSignedInt() {
		const short = this.readSignedIntLocal(this.offset, 2);
		this.offset += 2;

		return short;
	}

	/**
	 * Read a single byte from the buffer
	 *
	 * @category Data
	 * @returns {number}
	 */
	readByte() {
		return this.read();
	}

	// read a set number of bytes from the buffer
	/**
	 * Read a set number of bytes from the buffer
	 *
	 * @category Data
	 * @param {number} length Number of bytes to read
	 * @returns {number|number[]} number if length = 1, otherwise number[]
	 */
	read(length) {
		let data = null;
		if (length == undefined) {
			length = this.buffer.length;
		}

		if (length > 1) {
			data = this.buffer.slice(this.offset, this.offset + length);
			this.offset += length;
		} else {
			data = this.buffer[this.offset];
			this.offset += 1;
		}
		return data;
	}

	/**
	 * Advance the pointer forward a set number of bytes
	 *
	 * @category Positioning
	 * @param {number} length Number of bytes to skip
	 */
	skip(length) {
		this.offset += length;
	}
}

module.exports = RandomAccessFile;
// module.exports.RandomAccessFile = RandomAccessFile;
// module.exports.BIG_ENDIAN = BIG_ENDIAN;
// module.exports.LITTLE_ENDIAN = LITTLE_ENDIAN;