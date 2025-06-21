export function stopAllMediaTracks(stream) {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}
