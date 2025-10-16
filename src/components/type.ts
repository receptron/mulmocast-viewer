export type BundleItem = {
  text?: string;
  multiLinguals?: Record<string, string>;
  audioSources?: Record<string, string | undefined>;
  imageSource?: string;
  videoSource?: string;
  videoWithAudioSource?: string;
  htmlImageSource?: string;
  duration?: number;
};
