import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { shallow } from "zustand/shallow";
import { embedFieldNameSchema, embedFieldValueSchema } from "../discord/schema";
import { useCurrentMessageStore } from "../state/message";
import Collapsable from "./Collapsable";
import EditorInput from "./EditorInput";
import ValidationError from "./ValidationError";

interface Props {
  embedIndex: number;
  fieldIndex: number;
}

export default function EditorEmbedField({ embedIndex, fieldIndex }: Props) {
  const fieldCount = useCurrentMessageStore(
    (state) => state.embeds[embedIndex].fields.length
  );
  const [name, setName] = useCurrentMessageStore(
    (state) => [
      state.embeds[embedIndex].fields[fieldIndex].name,
      state.setEmbedFieldName,
    ],
    shallow
  );
  const [value, setValue] = useCurrentMessageStore(
    (state) => [
      state.embeds[embedIndex].fields[fieldIndex].value,
      state.setEmbedFieldValue,
    ],
    shallow
  );
  const [inline, setInline] = useCurrentMessageStore(
    (state) => [
      state.embeds[embedIndex].fields[fieldIndex].inline,
      state.setEmbedFieldInline,
    ],
    shallow
  );
  const [moveUp, moveDown, duplicate, remove] = useCurrentMessageStore(
    (state) => [
      state.moveEmbedFieldUp,
      state.moveEmbedFieldDown,
      state.duplicateEmbedField,
      state.deleteEmbedField,
    ],
    shallow
  );

  return (
    <div className="border-2 border-dark-6 rounded-md p-3">
      <Collapsable
        id={`embeds.${embedIndex}.fields.${fieldIndex}`}
        title={`Field ${fieldIndex + 1}`}
        extra={
          name && (
            <div className="text-gray-500 truncate flex space-x-2 pl-2">
              <div>-</div>
              <div className="truncate">{name}</div>
            </div>
          )
        }
        buttons={
          <div className="flex-none text-gray-300 flex items-center space-x-2">
            {fieldIndex > 0 && (
              <ChevronUpIcon
                className="h-6 w-6 flex-none"
                role="button"
                onClick={() => moveUp(embedIndex, fieldIndex)}
              />
            )}
            {fieldIndex < fieldCount - 1 && (
              <ChevronDownIcon
                className="h-6 w-6 flex-none"
                role="button"
                onClick={() => moveDown(embedIndex, fieldIndex)}
              />
            )}
            {fieldCount < 25 && (
              <DocumentDuplicateIcon
                className="h-5 w-5 flex-none"
                role="button"
                onClick={() => duplicate(embedIndex, fieldIndex)}
              />
            )}
            <TrashIcon
              className="h-5 w-5 flex-none"
              role="button"
              onClick={() => remove(embedIndex, fieldIndex)}
            />
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex space-x-3">
            <EditorInput
              label="Name"
              value={name}
              onChange={(v) => setName(embedIndex, fieldIndex, v)}
              maxLength={256}
              className="w-full"
            >
              <ValidationError schema={embedFieldNameSchema} value={name} />
            </EditorInput>
            <div>
              <div className="uppercase text-gray-300 text-sm font-medium mb-1.5">
                Inline
              </div>
              <div
                className="w-10 h-10 bg-dark-2 rounded cursor-pointer p-1.5 text-white"
                role="button"
                onClick={() => setInline(embedIndex, fieldIndex, !inline)}
              >
                {inline && <CheckIcon />}
              </div>
            </div>
          </div>
          <EditorInput
            type="textarea"
            label="Value"
            value={value}
            onChange={(v) => setValue(embedIndex, fieldIndex, v)}
            maxLength={1024}
          >
            <ValidationError schema={embedFieldValueSchema} value={value} />
          </EditorInput>
        </div>
      </Collapsable>
    </div>
  );
}
