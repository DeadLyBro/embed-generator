import { useCurrentMessageStore } from "../state/message";
import EditorEmbedAuthor from "./EditorEmbedAuthor";
import Collapsable from "./Collapsable";
import EditorEmbedBody from "./EditorEmbedBody";
import EditorEmbedFields from "./EditorEmbedFields";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { shallow } from "zustand/shallow";
import EditorEmbedImages from "./EditorEmbedImages";
import EditorEmbedFooter from "./EditorEmbedFooter";
import { useMemo } from "react";
import { useCollapsedStatesStore } from "../state/collapsed";

interface Props {
  embedIndex: number;
}

export default function EditorEmbed({ embedIndex }: Props) {
  const embedId = useCurrentMessageStore(
    (state) => state.embeds[embedIndex].id
  );
  const embedName = useCurrentMessageStore((state) => {
    const embed = state.embeds[embedIndex];
    return embed.author?.name || embed.title;
  });
  const embedCount = useCurrentMessageStore((state) => state.embeds.length);

  const [moveUp, moveDown, duplicate, remove] = useCurrentMessageStore(
    (state) => [
      state.moveEmbedUp,
      state.moveEmbedDown,
      state.duplicateEmbed,
      state.deleteEmbed,
    ],
    shallow
  );

  const color = useCurrentMessageStore(
    (state) => state.embeds[embedIndex]?.color
  );

  const hexColor = useMemo(
    () => (color !== undefined ? "#" + color.toString(16) : "#1f2225"),
    [color]
  );

  const clearCollapsedWithPrefix = useCollapsedStatesStore(
    (state) => state.clearCollapsedWithPrefix
  );

  function wrappedRemove() {
    clearCollapsedWithPrefix(`embeds.${embedId}`);
    remove(embedIndex);
  }

  return (
    <div
      className="mb-3 bg-dark-3 p-3 rounded-md border-l-4"
      style={{ borderColor: hexColor }}
    >
      <Collapsable
        title={`Embed ${embedIndex + 1}`}
        id={`embeds.${embedId}`}
        size="large"
        extra={
          embedName && (
            <div className="text-gray-500 truncate flex space-x-2 pl-2">
              <div>-</div>
              <div className="truncate">{embedName}</div>
            </div>
          )
        }
        buttons={
          <div className="flex-none text-gray-300 flex items-center space-x-2">
            {embedIndex > 0 && (
              <ChevronUpIcon
                className="h-6 w-6 flex-none"
                role="button"
                onClick={() => moveUp(embedIndex)}
              />
            )}
            {embedIndex < embedCount - 1 && (
              <ChevronDownIcon
                className="h-6 w-6 flex-none"
                role="button"
                onClick={() => moveDown(embedIndex)}
              />
            )}
            {embedCount < 10 && (
              <DocumentDuplicateIcon
                className="h-5 w-5 flex-none"
                role="button"
                onClick={() => duplicate(embedIndex)}
              />
            )}
            <TrashIcon
              className="h-5 w-5 flex-none"
              role="button"
              onClick={wrappedRemove}
            />
          </div>
        }
      >
        <div className="space-y-4">
          <EditorEmbedAuthor embedIndex={embedIndex} />
          <EditorEmbedBody embedIndex={embedIndex} />
          <EditorEmbedImages embedIndex={embedIndex} />
          <EditorEmbedFooter embedIndex={embedIndex} />
          <EditorEmbedFields embedIndex={embedIndex} />
        </div>
      </Collapsable>
    </div>
  );
}
