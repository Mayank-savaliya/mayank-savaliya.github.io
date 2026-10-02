export const INTRO_DURATION = 10000;
export const INTRO_AUDIO =
  import.meta.env.BASE_URL + "audio/hedwigs-theme-intro.m4a";

// Start inside the user's click/key handler. The local ten-second excerpt has
// its 1.2-second fade-in and 2-second fade-out baked in, including on iOS,
// where changing an HTML audio element's volume is not consistently supported.
export async function playIntroTheme(audio) {
  if (!audio) return false;
  let timeout;
  try {
    audio.currentTime = 0;
    audio.muted = false;
    await Promise.race([
      audio.play(),
      new Promise((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Audio start timed out")),
          4000,
        );
      }),
    ]);
    return true;
  } catch {
    audio.pause();
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
