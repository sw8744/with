import {Link} from "react-router-dom";
import type {ReactNode} from "react";

interface InformationAreaPropsType {
  title: string;
  uid: string;
  imagePath: string;
  children: ReactNode;
}

interface ThemeTagPropsType {
  emogi: string;
  name: string;
  color: string;
  textColor?: string | null;
}

function PlaceArea(
  props: InformationAreaPropsType
) {
  return (
    <Link
      className={'w-full shadow-neutral-300 shadow rounded-xl overflow-clip flex flex-row'}
      to={'/location/place/' + props.uid}
    >
      <img
        src={props.imagePath}
        className={
          'h-[130px] w-1/2 object-cover ' +
          '[mask-image:linear-gradient(to_right,black_70%,transparent)] ' +
          '[mask-repeat:no-repeat] [mask-size:100%_100%]'
        }
      />

      <div className={'px-3 py-3'}>
        <p className={'font-bold text-lg'}>{props.title}</p>
        {props.children}
      </div>
    </Link>
  );
}

function ThemeTag(
  props: ThemeTagPropsType
) {
  return (
    <span
      style={{
        backgroundColor: props.color,
        color: props.textColor ?? '#0C0C0C',
      }}
      className={'rounded-lg px-2 py-1'}
    >{props.emogi} {props.name}</span>
  )
}

function RegionShowcase() {
  return (
    <>
      <img
        src={'https://cdn.thescoop.co.kr/news/photo/201909/36658_48383_542.jpg'}
        className={'mb-10 w-full'}
      />

      <div className={'flex flex-col justify-baseline items-center gap-3'}>
        <p className={'text-3xl font-extrabold'}>홍대 / 연남</p>
        <p className={'text-lg font-medium'}>청춘과 덕질의 거리</p>
        <div className={'flex justify-center items-center gap-2'}>
          <ThemeTag emogi={'❤️'} name={'연인'} color={'#ffc1cc'}/>
          <ThemeTag emogi={'🔥'} name={'청춘'} color={'#ffc1cc'}/>
        </div>
      </div>


      <div className={'flex flex-col justify-baseline items-center gap-4 mx-5 my-5'}>
        <PlaceArea
          title={'4233 마음센터 연남동'}
          uid={'aaaa'}
          imagePath={'https://file.newswire.co.kr/data/datafile2/thumb_640/2023/05/30831706_20230531114616_2625462147.jpg'}
        >
          <p className={'text-sm'}>설명이시따</p>
        </PlaceArea>

        <PlaceArea
          title={'제로월드 홍대점'}
          uid={'aaaa'}
          imagePath={'https://zerohongdae.com/storage/stores/aaiWH777yg2WZPvMKGQa4VICG51stXgJy0QmAG99.jpg'}
        >
          <p className={'text-sm'}>방탈출카페데스</p>
        </PlaceArea>
      </div>

      <p className={'py-1 ml-5'}>서울 &gt; 홍대/연남</p>
    </>
  );
}

export default RegionShowcase;
