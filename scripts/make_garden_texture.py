#!/usr/bin/env python3
import os
import random
import struct
import zlib


def chunk(name, payload):
    return (
        struct.pack(">I", len(payload))
        + name
        + payload
        + struct.pack(">I", zlib.crc32(name + payload) & 0xFFFFFFFF)
    )


def pixel(x, y, width, height):
    random.seed(x * 92821 + y * 68917)
    sky = y < height * 0.24
    if sky:
        return (210 + random.randrange(20), 228 + random.randrange(18), 232 + random.randrange(12))
    bed = height * 0.58 < y < height * 0.9 and width * 0.08 < x < width * 0.92
    if bed:
        stripe = (x // 34) % 2
        soil = (104 + random.randrange(28), 74 + random.randrange(22), 52 + random.randrange(16))
        leaf = (32 + random.randrange(35), 106 + random.randrange(55), 72 + random.randrange(28))
        return leaf if (y + x // 3 + stripe * 17) % 31 < 9 else soil
    path = y >= height * 0.9
    if path:
        return (174 + random.randrange(16), 151 + random.randrange(15), 118 + random.randrange(13))
    return (93 + random.randrange(40), 127 + random.randrange(45), 83 + random.randrange(35))


def write_png(path, width=900, height=640):
    rows = []
    for y in range(height):
        row = bytearray([0])
        for x in range(width):
            row.extend(pixel(x, y, width, height))
        rows.append(bytes(row))
    raw = b"".join(rows)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as file:
        file.write(png)


if __name__ == "__main__":
    write_png("public/assets/garden-bed.png")
