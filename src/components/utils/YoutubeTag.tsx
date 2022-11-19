import { Youtube } from "iconsax-react";
import React from "react";
import { ArrowNE } from "./SvgHub";

const YoutubeTag = ({ url }: { url: string }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center max-w-fit xs:max-w-none bg-transparent hover:ring-[1px] ring-[#FF0000]/50 rounded-lg px-2 py-1 transition-all"
    >
      <Youtube size="16" color="#FF0000" variant="Bold" />
      <p className="text-[10px] font-medium text-[#FF0000] font-Lexend ml-2 mr-1">
        Watch the event
      </p>
      <ArrowNE color="#FF0000" />
    </a>
  );
};

export default YoutubeTag;
