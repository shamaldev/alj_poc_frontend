import lamejs from "lamejs";

export function encodeMp3(buffers, sampleRate) {
  const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128); // Mono, 128kbps
  let mp3Data = [];

  for (const buffer of buffers) {
    const samples = buffer.map(x => Math.max(-1, Math.min(1, x)) * 32767);
    const int16 = Int16Array.from(samples);
    const mp3buf = mp3encoder.encodeBuffer(int16);
    if (mp3buf.length > 0) mp3Data.push(mp3buf);
  }

  const end = mp3encoder.flush();
  if (end.length > 0) mp3Data.push(end);

  return new Blob(mp3Data, { type: "audio/mp3" });
}
