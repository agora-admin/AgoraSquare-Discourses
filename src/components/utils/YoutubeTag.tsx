import { Youtube } from "iconsax-react";
import React from "react";

const YoutubeTag = ({ url }: { url: string }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center bg-[#FF0000]/20 rounded-lg px-2 py-1 transition-all"
    >
      <Youtube size="16" color="#FF0000" variant="Bold" />
      <p className="text-[10px] font-medium text-[#FF0000] font-Lexend ml-2 mr-1">
        Watch the event
      </p>
    </a>
  );
};

export default YoutubeTag;
