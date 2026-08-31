"use client";

/* eslint-disable @next/next/no-img-element */
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Disc3,
  Heart,
  LoaderCircle,
  Music,
  Play,
  Share2,
  ThumbsDown,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApi } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";
import type { Paginated, WatchClip } from "@/lib/types";
import { useUi } from "@/stores/ui";

const FALLBACK_CLIPS: WatchClip[] = [
  {
    id: 1,
    title: "Rare Historic Recording from Swadhin Bangla Betar Kendra Studio (1971)",
    title_bn: "স্বাধীন বাংলা বেতার কেন্দ্রের ঐতিহাসিক দুর্লভ স্টুডিও রেকর্ডিং (১৯৭১)",
    description: "Original wartime broadcast audio reel preserved at the national Betar sound archive.",
    description_bn: "জাতীয় বেতার শব্দ আর্কাইভে সংরক্ষিত মুক্তিযুদ্ধকালীন মূল সম্প্রচারিত অডিও রিল।",
    slug: "historic-swadhin-bangla-betar-1971",
    creator_name: "Bangladesh Betar Archive",
    creator_handle: "@bangladeshbetar",
    creator_avatar_url: null,
    video_url: null,
    thumbnail_url: "/editorial/watch-hero.png",
    audio_track: "Original Radio Relay (1971) · Swadhin Bangla Betar",
    hashtags: ["#History", "#1971", "#BetarArchive", "#Shorts"],
    likes_count: 14820,
    dislikes_count: 42,
    published_at: null,
  },
  {
    id: 2,
    title: "Acoustic Bhatiyali River Song Live at Sunset on the Meghna",
    title_bn: "মেঘনার মোহনায় সূর্যাস্তের মনোরম ভাটিয়ালি গানের সুর",
    description: "Soulful river folk melody performed live by traditional Baul singers on a country boat.",
    description_bn: "গ্রামীণ নৌকায় ঐতিহ্যবাহী বাউল শিল্পীদের সরাসরি পরিবেশনায় মন জুড়ানো ভাটিয়ালি গান।",
    slug: "acoustic-bhatiyali-river-song",
    creator_name: "Betar Folk Hub",
    creator_handle: "@betarfolk",
    creator_avatar_url: null,
    video_url: null,
    thumbnail_url: "/editorial/watch-river.png",
    audio_track: "Nodi Bhora Dheu · Baul Acoustic Live",
    hashtags: ["#FolkMusic", "#RiverLife", "#Baul", "#Shorts"],
    likes_count: 8940,
    dislikes_count: 19,
    published_at: null,
  },
  {
    id: 3,
    title: "Behind the Scenes: How Foley Voice Artists Create Thunder in Radio Drama",
    title_bn: "বেতার নাটকের নেপথ্যে: কীভাবে তৈরি হয় বজ্রপাত ও বৃষ্টির শব্দ?",
    description: "Foley artists at Studio 4 demonstrate live acoustic sound effect techniques using metal sheets and water tubs.",
    description_bn: "স্টুডিও ৪-এর শব্দশিল্পীরা টিনের পাত ও জলের পাত্র ব্যবহার করে নিখুঁত বৃষ্টির শব্দ তৈরির কৌশল দেখাচ্ছেন।",
    slug: "foley-voice-artists-thunder-radio-drama",
    creator_name: "Drama Studio 4",
    creator_handle: "@betardrama",
    creator_avatar_url: null,
    video_url: null,
    thumbnail_url: "/editorial/news-tech.png",
    audio_track: "Original Studio Foley Sound Effects",
    hashtags: ["#BehindTheScenes", "#Foley", "#RadioDrama", "#Shorts"],
    likes_count: 12350,
    dislikes_count: 58,
    published_at: null,
  },
  {
    id: 4,
    title: "Midnight Bhoot Shonibar Listener Story Teaser: The Haunted Tea Estate",
    title_bn: "ভূত শনিবারের গা শিউরে ওঠা সত্য ঘটনা: চা বাগানের গভীর রাতে",
    description: "A chilling excerpt from midnight broadcast recounting an unexplained phenomenon in Sreemangal tea hills.",
    description_bn: "শ্রীমঙ্গলের চা বাগানের গভীর রাতের এক রহস্যময় ও রোমাঞ্চকর অলৌকিক অভিজ্ঞতার অংশবিশেষ।",
    slug: "bhoot-shonibar-haunted-tea-estate",
    creator_name: "Bhoot Shonibar Official",
    creator_handle: "@bhootshonibar",
    creator_avatar_url: null,
    video_url: null,
    thumbnail_url: "/editorial/watch-hero.png",
    audio_track: "Midnight Radio Eerie Atmosphere Theme",
    hashtags: ["#BhootShonibar", "#Horror", "#Supernatural", "#Shorts"],
    likes_count: 24700,
    dislikes_count: 110,
    published_at: null,
  },
  {
    id: 5,
    title: "Young Student Inventors Build Floating Solar Pumps for Rural Farmers",
    title_bn: "তরুণ শিক্ষার্থীদের তৈরি জলের ওপর ভাসমান সৌরবিদ্যুৎ চালিত পাম্প",
    description: "BUET engineering students introduce low-cost eco-friendly agricultural irrigation solutions.",
    description_bn: "বুয়েটের প্রকৌশল শিক্ষার্থীদের উদ্ভাবিত সাশ্রয়ী ও পরিবেশবান্ধব কৃষি সেচ সমাধান।",
    slug: "floating-solar-pumps-rural-farmers",
    creator_name: "Innovators of Bangladesh",
    creator_handle: "@innovatorsbd",
    creator_avatar_url: null,
    video_url: null,
    thumbnail_url: "/editorial/news-rice.png",
    audio_track: "Tomorrow's Builders Tech Beat",
    hashtags: ["#Innovation", "#Solar", "#GreenTech", "#Shorts"],
    likes_count: 6730,
    dislikes_count: 15,
    published_at: null,
  },
  {
    id: 6,
    title: "Traditional Monsoon Ilish Cooking Secret in Under 60 Seconds",
    title_bn: "৬০ সেকেন্ডে বর্ষার ঐতিহ্যবাহী সরিষা ইলিশ রান্নার গোপন রেসিপি",
    description: "Culinary masterclass exploring authentic mustard Hilsa preparations from Chandpur.",
    description_bn: "চাঁদপুরের ঐতিহ্যবাহী খাঁটি সরিষা ইলিশ রান্নার নিখুঁত রেসিপি।",
    slug: "monsoon-ilish-cooking-secret",
    creator_name: "The Monsoon Kitchen",
    creator_handle: "@monsoonkitchen",
    creator_avatar_url: null,
    video_url: null,
    thumbnail_url: "/editorial/news-coast.png",
    audio_track: "Rustic Kitchen Beats · Folk Rhythms",
    hashtags: ["#Food", "#Ilish", "#BengaliCuisine", "#Shorts"],
    likes_count: 18900,
    dislikes_count: 84,
    published_at: null,
  },
  {
    id: 7,
    title: "Master Sitarist Performs Raga Megh with National Symphony",
    title_bn: "জাতীয় সিম্ফনির সাথে রাগ মেঘের অনবদ্য সেতার পরিবেশনা",
    description: "Hypnotic classical Indian instrumental rendition welcoming the arrival of monsoon rain.",
    description_bn: "বর্ষা বন্দনায় বাংলাদেশ বেতার জাতীয় সিম্ফনি অর্কেস্ট্রার সাথে রাগ মেঘের পরিবেশনা।",
    slug: "master-sitarist-raga-megh",
    creator_name: "Betar Classical Music",
    creator_handle: "@betarclassical",
    creator_avatar_url: null,
    video_url: null,
    thumbnail_url: "/editorial/watch-music.png",
    audio_track: "Raga Megh · Classical Sitar Ensemble",
    hashtags: ["#ClassicalMusic", "#Sitar", "#Raga", "#Shorts"],
    likes_count: 11240,
    dislikes_count: 31,
    published_at: null,
  },
  {
    id: 8,
    title: "2,500-Year-Old Terracotta Artifacts Unearthed at Mahasthangarh",
    title_bn: "মহাস্থানগড়ে উন্মোচিত আড়াই হাজার বছরের প্রাচীন পোড়ামাটির নিদর্শন",
    description: "Archaeologists unveil extraordinary ancient Maurya-era architectural terracotta seals in Bogura.",
    description_bn: "বগুড়ার মহাস্থানগড়ে আবিষ্কৃত মৌর্য যুগের বিরল পোড়ামাটির সিলমোহর ও প্রত্নসম্পদ।",
    slug: "terracotta-artifacts-mahasthangarh",
    creator_name: "Heritage Bangladesh",
    creator_handle: "@heritagebd",
    creator_avatar_url: null,
    video_url: null,
    thumbnail_url: "/editorial/watch-river.png",
    audio_track: "Echoes of Antiquity · Historical Theme",
    hashtags: ["#Archaeology", "#Heritage", "#Mahasthangarh", "#Shorts"],
    likes_count: 9540,
    dislikes_count: 22,
    published_at: null,
  },
];

function formatCount(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

export default function WatchClipsPage() {
  const { locale, t } = useTranslation();
  const router = useRouter();
  const toast = useUi((s) => s.toast);

  const { data: clipsResponse, isLoading } = useApi<Paginated<WatchClip>>("/watch-clips?per_page=50");
  const clips = clipsResponse?.data && clipsResponse.data.length > 0 ? clipsResponse.data : FALLBACK_CLIPS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
  const [dislikedMap, setDislikedMap] = useState<Record<number, boolean>>({});
  const [likesCountMap, setLikesCountMap] = useState<Record<number, number>>({});
  const [sharesCountMap, setSharesCountMap] = useState<Record<number, number>>({});
  const [progress, setProgress] = useState(0);

  // Gesture dragging state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartYRef = useRef(0);
  const mouseStartYRef = useRef(0);
  const isMouseDownRef = useRef(false);
  const wheelLockRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentClip = clips[Math.min(currentIndex, clips.length - 1)] || clips[0];

  // Reset showMore when slide changes
  useEffect(() => {
    setShowMore(false);
    setDragOffset(0);
  }, [currentIndex]);

  // Video progress / mock progress
  useEffect(() => {
    setProgress(0);
    if (!isPlaying) return;

    if (currentClip?.video_url && videoRef.current) {
      const vid = videoRef.current;
      const onTimeUpdate = () => {
        if (vid.duration) {
          setProgress((vid.currentTime / vid.duration) * 100);
        }
      };
      vid.addEventListener("timeupdate", onTimeUpdate);
      return () => vid.removeEventListener("timeupdate", onTimeUpdate);
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1.2;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [currentIndex, isPlaying, currentClip?.video_url]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % clips.length);
  }, [clips.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + clips.length) % clips.length);
  }, [clips.length]);

  // TouchPad / Mouse Wheel Sliding (with smooth debounce threshold)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (wheelLockRef.current || showMore) return;

    if (Math.abs(e.deltaY) > 28) {
      wheelLockRef.current = true;
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 450);
    }
  }, [handleNext, handlePrev, showMore]);

  // Touch Swipe Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (showMore) return;
    touchStartYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || showMore) return;
    const diff = e.touches[0].clientY - touchStartYRef.current;
    // Apply rubber-band damping
    setDragOffset(diff * 0.75);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset < -55) {
      handleNext();
    } else if (dragOffset > 55) {
      handlePrev();
    }
    setDragOffset(0);
  };

  // Mouse Drag Gestures (Desktop slide experience)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (showMore) return;
    mouseStartYRef.current = e.clientY;
    isMouseDownRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || showMore) return;
    const diff = e.clientY - mouseStartYRef.current;
    if (Math.abs(diff) > 6) {
      setIsDragging(true);
      setDragOffset(diff * 0.7);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;

    if (isDragging) {
      setIsDragging(false);
      if (dragOffset < -50) {
        handleNext();
      } else if (dragOffset > 50) {
        handlePrev();
      }
      setDragOffset(0);
    } else {
      // If it was just a quick click without dragging, toggle play/pause
      setIsPlaying((p) => !p);
    }
  };

  const handleMouseLeave = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      if (isDragging) {
        setIsDragging(false);
        if (dragOffset < -50) {
          handleNext();
        } else if (dragOffset > 50) {
          handlePrev();
        }
        setDragOffset(0);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key.toLowerCase() === "m") {
        setIsMuted((m) => !m);
      } else if (e.key === "Escape") {
        router.push("/watch");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, router]);

  // Dynamic reaction handlers
  const toggleLike = (clipId: number) => {
    const currentlyLiked = likedMap[clipId] ?? false;
    const currentlyDisliked = dislikedMap[clipId] ?? false;
    const initialCount = clips.find((c) => c.id === clipId)?.likes_count ?? 14800;
    const currentCount = likesCountMap[clipId] ?? initialCount;

    if (currentlyLiked) {
      setLikedMap((prev) => ({ ...prev, [clipId]: false }));
      setLikesCountMap((prev) => ({ ...prev, [clipId]: Math.max(0, currentCount - 1) }));
    } else {
      setLikedMap((prev) => ({ ...prev, [clipId]: true }));
      setLikesCountMap((prev) => ({ ...prev, [clipId]: currentCount + 1 }));
      if (currentlyDisliked) {
        setDislikedMap((prev) => ({ ...prev, [clipId]: false }));
      }
      toast("Added to Liked Clips", "success");
    }
  };

  const toggleDislike = (clipId: number) => {
    const currentlyDisliked = dislikedMap[clipId] ?? false;
    const currentlyLiked = likedMap[clipId] ?? false;
    const initialCount = clips.find((c) => c.id === clipId)?.likes_count ?? 14800;
    const currentCount = likesCountMap[clipId] ?? initialCount;

    if (currentlyDisliked) {
      setDislikedMap((prev) => ({ ...prev, [clipId]: false }));
    } else {
      setDislikedMap((prev) => ({ ...prev, [clipId]: true }));
      if (currentlyLiked) {
        setLikedMap((prev) => ({ ...prev, [clipId]: false }));
        setLikesCountMap((prev) => ({ ...prev, [clipId]: Math.max(0, currentCount - 1) }));
      }
    }
  };

  const handleShare = (clip: WatchClip) => {
    const initialShares = Math.floor(clip.likes_count * 0.15) || 520;
    const currentShares = sharesCountMap[clip.id] ?? initialShares;
    setSharesCountMap((prev) => ({ ...prev, [clip.id]: currentShares + 1 }));

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast(t("watch.copied", { defaultValue: "Link copied to clipboard!" }), "success");
    }
  };

  const isLiked = likedMap[currentClip.id] ?? false;
  const isDisliked = dislikedMap[currentClip.id] ?? false;
  const currentLikes = likesCountMap[currentClip.id] ?? currentClip.likes_count;
  const currentShares = sharesCountMap[currentClip.id] ?? (Math.floor(currentClip.likes_count * 0.15) || 520);

  const title = locale === "bn" ? currentClip.title_bn || currentClip.title : currentClip.title;
  const description = locale === "bn" ? currentClip.description_bn || currentClip.description : currentClip.description;
  const creatorName = currentClip.creator_name || "Bangladesh Betar";
  const posterUrl = currentClip.thumbnail_url || "/editorial/watch-hero.png";
  const soundtrack = currentClip.audio_track || "Original Betar Audio Track";
  const hashtags = currentClip.hashtags && currentClip.hashtags.length > 0
    ? currentClip.hashtags
    : ["#Betar", "#Watch", "#Shorts"];

  if (isLoading && !clipsResponse) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0d0204] text-white">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="size-10 animate-spin text-[#e50914]" />
          <p className="font-display text-lg font-bold tracking-wide text-white/80">Loading Betar Clips…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onWheel={handleWheel}
      className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#0d0204] text-white select-none touch-none"
    >
      {/* Top Left Floating Back Button */}
      <div className="fixed left-4 top-4 z-50 sm:left-6 sm:top-6">
        <Link
          href="/watch"
          className="group flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2.5 text-sm font-bold text-white shadow-2xl backdrop-blur-xl transition hover:scale-105 hover:border-white/40 hover:bg-black/80 active:scale-95"
          title={t("watch.backToWatch", { defaultValue: "Back to Betar Watch" })}
        >
          <ArrowLeft className="size-4.5 transition group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">{t("watch.back", { defaultValue: "Back to Watch" })}</span>
        </Link>
      </div>

      {/* Ambient Blurred Backdrop from Current Clip */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-25 blur-3xl pointer-events-none">
        <img src={posterUrl} alt="" className="size-full object-cover scale-150" />
      </div>

      {/* Atmospheric Watch Glow Accents */}
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-[#e50914]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-[#e50914]/10 blur-3xl pointer-events-none" />

      {/* Main Vertical Player Frame with Interactive Drag/Slide Transform */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1)",
        }}
        className="relative z-10 h-full w-full max-w-[440px] overflow-hidden shadow-2xl sm:my-auto sm:h-[94%] sm:max-h-[920px] sm:rounded-3xl sm:border sm:border-white/15 sm:bg-[#140608] cursor-grab active:cursor-grabbing"
      >
        {/* Video / Poster Media Container (Fills Entire Frame) */}
        <div className="group absolute inset-0 overflow-hidden bg-black">
          {currentClip.video_url ? (
            <video
              ref={videoRef}
              key={currentClip.video_url}
              src={currentClip.video_url}
              poster={posterUrl}
              autoPlay={isPlaying}
              loop
              muted={isMuted}
              playsInline
              className="size-full object-cover pointer-events-none"
            />
          ) : (
            <img
              src={posterUrl}
              alt=""
              className={`size-full object-cover pointer-events-none transition-transform duration-700 ${
                isPlaying ? "scale-105" : "scale-100"
              }`}
            />
          )}

          {/* Gradients for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/30 pointer-events-none" />

          {/* Play/Pause Overlay indicator */}
          {!isPlaying && (
            <div className="absolute inset-0 grid place-items-center bg-black/40 pointer-events-none">
              <span className="grid size-18 place-items-center rounded-full bg-[#e50914]/80 text-white shadow-2xl backdrop-blur-md transition hover:scale-110">
                <Play className="ml-1 size-9 fill-current" />
              </span>
            </div>
          )}
        </div>

        {/* Top Controls Row: absolute at top right */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-end p-4 pt-5 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted((m) => !m);
            }}
            className="grid size-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/80 hover:scale-105 cursor-pointer"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="size-5 text-white/80" /> : <Volume2 className="size-5 text-white" />}
          </button>
        </div>

        {/* Bottom Container: absolute pinned directly to bottom */}
        <div className="absolute bottom-0 inset-x-0 z-20 flex flex-col justify-end pointer-events-none">
          {/* Content Row: Left Metadata + Right Action Rail */}
          <div className="flex items-end justify-between gap-3 p-4 pb-3 sm:p-5 sm:pb-3 pointer-events-auto">
            {/* Left Column: Creator + Single-line Title with ...more */}
            <div className="min-w-0 flex-1 max-w-[78%]">
              {/* Creator Profile */}
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="size-8 shrink-0 overflow-hidden rounded-full border border-white/40 bg-zinc-800 shadow-md">
                  {currentClip.creator_avatar_url ? (
                    <img src={currentClip.creator_avatar_url} alt="" className="size-full object-cover" />
                  ) : (
                    <img src={posterUrl} alt="" className="size-full object-cover" />
                  )}
                </div>
                <p className="truncate font-display text-sm font-bold text-white drop-shadow">
                  {creatorName}
                </p>
              </div>

              {/* Collapsed vs Expanded State */}
              {!showMore ? (
                <div className="text-sm font-medium text-white/95 drop-shadow leading-snug">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="truncate max-w-[calc(100%-4rem)]">{title}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMore(true);
                      }}
                      className="inline-block font-bold text-white/70 hover:text-white underline cursor-pointer text-xs"
                    >
                      ...more
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="space-y-2.5 rounded-2xl bg-black/90 p-3.5 backdrop-blur-xl border border-white/15 max-h-[55vh] overflow-y-auto shadow-2xl mb-1"
                >
                  <h2 className="font-display text-sm font-bold text-white leading-snug">
                    {title}
                  </h2>

                  {description && (
                    <p className="text-xs leading-relaxed text-white/80">
                      {description}
                    </p>
                  )}

                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/90"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs font-bold text-white/85 pt-1">
                    <Music className="size-3.5 shrink-0 animate-pulse text-[#e50914]" />
                    <span className="truncate">{soundtrack}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMore(false);
                    }}
                    className="text-xs font-bold text-[#e50914] hover:underline block pt-1 cursor-pointer"
                  >
                    ...less
                  </button>
                </div>
              )}
            </div>

            {/* Right Action Rail: Like, Dislike, Share, Spinning Disc */}
            <div className="flex flex-col items-center gap-3 shrink-0 pb-0.5">
              {/* Like */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(currentClip.id);
                }}
                className="group flex flex-col items-center gap-1 cursor-pointer"
                aria-label="Like Clip"
              >
                <span
                  className={`grid size-11 place-items-center rounded-full backdrop-blur-xl transition group-active:scale-90 ${
                    isLiked
                      ? "bg-[#e50914] text-white shadow-lg shadow-[#e50914]/50"
                      : "bg-black/50 text-white hover:bg-black/70"
                  }`}
                >
                  <Heart className={`size-5 ${isLiked ? "fill-white" : ""}`} />
                </span>
                <span className="text-[11px] font-bold text-white drop-shadow">
                  {formatCount(currentLikes)}
                </span>
              </button>

              {/* Dislike */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDislike(currentClip.id);
                }}
                className="group flex flex-col items-center gap-1 cursor-pointer"
                aria-label="Dislike Clip"
              >
                <span
                  className={`grid size-11 place-items-center rounded-full backdrop-blur-xl transition group-active:scale-90 ${
                    isDisliked
                      ? "bg-zinc-700 text-white"
                      : "bg-black/50 text-white hover:bg-black/70"
                  }`}
                >
                  <ThumbsDown className={`size-5 ${isDisliked ? "fill-white" : ""}`} />
                </span>
                <span className="text-[11px] font-bold text-white/80">
                  {t("watch.dislike", { defaultValue: "Dislike" })}
                </span>
              </button>

              {/* Share (with dynamic count) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(currentClip);
                }}
                className="group flex flex-col items-center gap-1 cursor-pointer"
                aria-label="Share Clip"
              >
                <span className="grid size-11 place-items-center rounded-full bg-black/50 text-white backdrop-blur-xl transition hover:bg-black/70 group-active:scale-90">
                  <Share2 className="size-5" />
                </span>
                <span className="text-[11px] font-bold text-white/80">
                  {formatCount(currentShares)}
                </span>
              </button>

              {/* Spinning Vinyl Audio Disc */}
              <div className="relative mt-0.5">
                <span
                  className={`grid size-10 place-items-center rounded-full border-2 border-neutral-700 bg-neutral-950 text-[#e50914] shadow-xl ${
                    isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
                  }`}
                >
                  <Disc3 className="size-5.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Video Progress Line: pinned to the very bottom */}
          <div className="h-1 w-full bg-white/20">
            <div
              className="h-full bg-[#e50914] transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Desktop Next / Previous Floating Controls on Right Rail */}
      <div className="hidden lg:fixed lg:right-12 lg:top-1/2 lg:z-30 lg:flex lg:-translate-y-1/2 lg:flex-col lg:gap-3.5">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Clip"
          className="grid size-13 place-items-center rounded-full border border-white/20 bg-black/60 text-white shadow-2xl backdrop-blur-xl transition hover:scale-110 hover:border-white/40 hover:bg-black/90 active:scale-95 cursor-pointer"
        >
          <ChevronUp className="size-7" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Clip"
          className="grid size-13 place-items-center rounded-full border border-white/20 bg-black/60 text-white shadow-2xl backdrop-blur-xl transition hover:scale-110 hover:border-white/40 hover:bg-black/90 active:scale-95 cursor-pointer"
        >
          <ChevronDown className="size-7" />
        </button>
      </div>
    </div>
  );
}
