import {useState} from "react";

function AddSegment() {
  const [showingAddedDialog, setShowingAddedDialog] = useState<boolean>(false);

  function closeAddDialog() {
    setShowingAddedDialog(false);
  }

  function addSegment() {

  }

  function showAddSegmentView() {

  }

  return (
    <>
      <button
        className={"w-full py-2 my-1 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-all duration-200"}
        onClick={addSegment}
      >
        + 일정 추가
      </button>
    </>
  )
}

export default AddSegment;
