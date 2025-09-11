import {Link} from "react-router-dom";
import {CheckListIcon, ClockIcon, PhoneAndClockIcon} from "../../assets/svgs/svgs.ts";
import type {ReactElement, ReactNode} from "react";

interface InformationAreaPropsType {
  title: string;
  icon: ReactElement;
  children: ReactNode;
}

interface ThemeTagPropsType {
  emogi: string;
  name: string;
  color: string;
  textColor?: string | null;
}

function InformationArea(
  props: InformationAreaPropsType
) {
  return (
    <div className={'mx-5 my-5'}>
      <div className={'flex flex-row gap-3 justify-start items-center mb-2'}>
        {props.icon}
        <p className={'font-bold text-lg'}>{props.title}</p>
      </div>
      <div className={'ml-5'}>{props.children}</div>
    </div>
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

function LocationShowcase() {
  return (
    <>
      <img
        src={'https://file.newswire.co.kr/data/datafile2/thumb_640/2023/05/30831706_20230531114616_2625462147.jpg'}
        className={'mb-10 w-full'}
      />

      <div className={'flex flex-col justify-baseline items-center gap-3'}>
        <p className={'text-3xl font-extrabold'}>4233 마음센터 연남</p>
        <p className={'text-lg font-medium'}>너와 나, 우리를 알아가는 시간</p>
        <div className={'flex justify-center items-center'}>
          <ThemeTag emogi={'❤️'} name={'연인'} color={'#ffc1cc'}/>
        </div>
      </div>


      <InformationArea
        title={'예약 정보'}
        icon={<PhoneAndClockIcon height={22}/>}
      >
        <p><Link
          to={'https://map.naver.com/p/search/4233%EB%A7%88%EC%9D%8C%EC%84%BC%ED%84%B0/place/1521554569?placePath=/ticket?entry=pll&from=nx&fromNxList=true&from=map&fromPanelNum=2&timestamp=202509041257&locale=ko&svcName=map_pcv5&searchText=4233%EB%A7%88%EC%9D%8C%EC%84%BC%ED%84%B0&from=map&fromNxList=true&fromPanelNum=2&timestamp=202509041257&locale=ko&svcName=map_pcv5&searchText=4233%EB%A7%88%EC%9D%8C%EC%84%BC%ED%84%B0&searchType=place&c=15.00,0,0,0,dh'}>예약
          링크</Link></p>
        <p><Link to={'tel://023381114'}>02-338-1114</Link></p>
      </InformationArea>

      <InformationArea
        title={'영업 시간'}
        icon={<ClockIcon height={22}/>}
      >
        <ul>
          <li>월: 10:30 - 21:00</li>
          <li>화: 휴무</li>
          <li>수: 10:30 - 21:00</li>
          <li>목: 10:30 - 21:00</li>
          <li>금: 10:30 - 21:00</li>
          <li>토: 10:30 - 21:00</li>
          <li>일: 10:30 - 21:00</li>
        </ul>
      </InformationArea>

      <InformationArea
        title={'운영 정보'}
        icon={<CheckListIcon height={22}/>}
      >
        <div className={'grid grid-cols-[auto_auto] w-fit'}>
          <div className={'flex flex-col w-fit pr-2'}>
            <span>주차</span>
            <span>주소</span>
          </div>
          <div className={'flex flex-col w-fit pl-2 border-l'}>
            <span>불가능</span>
            <span>서울 마포구 월드컵북로4길 43 지하1층</span>
          </div>
        </div>
      </InformationArea>

      <p className={'py-1 ml-5'}>서울 &gt; 홍대/연남 &gt; 4233마음센터 연남점</p>
    </>
  );
}

export default LocationShowcase;
