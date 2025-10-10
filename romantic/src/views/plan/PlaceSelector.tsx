import {Button} from "../elements/Buttons.tsx";

function PlaceSelector(
  {placeUUID, setPlaceUUID, prev, next}: {
    placeUUID: string[],
    setPlaceUUID: (regionList: string[]) => void,
    prev: () => void;
    next: () => void;
  }
) {
  return (
    <>
      <div className={'h-full'}>
      </div>
      <div>
        <div className={'flex justify-between'}>
          <Button onClick={prev}>이전</Button>
          <Button onClick={next}>만들기</Button>
        </div>
      </div>
    </>
  );
}

export default PlaceSelector;
