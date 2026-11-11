/** Saca el ID de un link de YouTube (youtube.com/watch?v=…, youtu.be/…, /shorts/…, /embed/…, /live/…). */
export function youtubeId(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const m = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m?.[1];
}

/** Miniatura del video (la sirve YouTube; `hqdefault` existe siempre, `maxresdefault` no). */
export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** Reproductor sin cookies de seguimiento hasta que se reproduce; arranca solo (siempre se abre por un clic). */
export const youtubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
