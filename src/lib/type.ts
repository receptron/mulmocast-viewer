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
  startTime?: number;
  endTime?: number;
};

export type ViewerData = {
  beats: BundleItem[];
  bgmSource?: string;
  bgmFile?: string;
  lang?: string;
};
