export type BundleItem = {
  text?: string;
  multiLinguals?: Record<string, string>;
  audioSources?: Record<string, string | undefined>;
  imageSource?: string;
  soundEffectSource?: string;
  videoSource?: string;
  videoWithAudioSource?: string;
  htmlImageSource?: string;
  duration?: number;
};

export type ViewerData = {
  beats: BundleItem[];
  bgmSource?: string;
  bgmFile?: string;
  lang?: string;
};
