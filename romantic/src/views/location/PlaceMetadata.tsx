import type {ReactElement, ReactNode} from "react";
import {CalendarBadgeIcon, CheckListIcon, ClockIcon, PhoneAndCheckIcon} from "../../assets/svgs/svgs.ts";
import {Link} from "react-router-dom";

interface InformationAreaPropsType {
  title: string;
  icon: ReactElement;
  children: ReactNode;
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

function OperationHoursInformation(
  {meta}: { meta: object | undefined }
) {
  if (
    !meta ||
    !('operation' in meta) || !(meta.operation instanceof Object) ||
    !('hours' in meta.operation) || !(meta.operation.hours instanceof Object)
  ) {
    return null;
  }

  const hours = meta.operation.hours as Record<string, string>;

  return (
    <InformationArea
      title={'영업 시간'}
      icon={<ClockIcon height={22}/>}
    >
      <div className={'grid grid-cols-[auto_auto] gap-x-2 w-fit'}>
        {Object.keys(hours).map(key => {
          return (
            <>
              <p className={'border-r border-neutral-600 pr-2 py-0.5'}>{key}</p>
              <p className={'py-0.5'}>{hours[key]}</p>
            </>
          );
        })}
      </div>
    </InformationArea>
  );
}

function OperationalInformation(
  {meta, address}: { meta: object | undefined, address: string | undefined }
) {
  if (!meta) return null;

  let parking: boolean | undefined = undefined;
  if (
    ('operation' in meta) && (meta.operation instanceof Object) &&
    ('parking' in meta.operation) && (typeof (meta.operation.parking) == "boolean")
  ) {
    parking = meta.operation.parking;
  }

  return (
    <InformationArea
      title={'운영 정보'}
      icon={<CheckListIcon height={22}/>}
    >
      <div className={'grid grid-cols-[auto_auto] gap-x-2 w-fit'}>
        {parking !== undefined &&
          <>
            <p className={'border-r border-neutral-600 pr-2'}>주차</p>
            <p>{parking ? '가능' : '불가능'}</p>
          </>
        }
        {address !== undefined &&
          <>
            <p className={'border-r border-neutral-600 pr-2'}>주소</p>
            <p>{address}</p>
          </>
        }
      </div>
    </InformationArea>
  );
}

function ReservationInformation(
  {meta}: { meta: object | undefined }
) {
  if (!meta || !('reservation' in meta) || !(meta.reservation instanceof Object)) {
    return null;
  }

  let reservationRqrd: boolean | undefined = undefined;
  let reservationMethod: string | undefined = undefined;
  let reservationTele: string | undefined = undefined;
  let reservationWeb: string | undefined = undefined;

  if ('required' in meta.reservation && typeof (meta.reservation.required) == 'boolean') reservationRqrd = meta.reservation.required;
  if ('method' in meta.reservation && typeof (meta.reservation.method) == 'string') reservationMethod = meta.reservation.method;
  if ('tel' in meta.reservation && typeof (meta.reservation.tel) == 'string') reservationTele = meta.reservation.tel;
  if ('web' in meta.reservation && typeof (meta.reservation.web) == 'string') reservationWeb = meta.reservation.web;

  return (
    <InformationArea
      title={'예약 정보'}
      icon={<CalendarBadgeIcon height={22}/>}
    >
      {reservationRqrd !== undefined &&
        <>
          <p>{reservationRqrd ? '예약 필수' : '예약 가능'}</p>
        </>
      }
      {reservationMethod !== undefined && <p>{reservationMethod}</p>}
      {reservationTele !== undefined &&
        <p><Link to={'tel://' + reservationTele.replaceAll('-', '')}>{reservationTele}</Link></p>}
      {reservationWeb !== undefined && <p><Link to={reservationWeb} target={'_blank'}>예약 사이트</Link></p>}
    </InformationArea>
  );
}

function InqueryInformation(
  {meta}: { meta: object | undefined }
) {
  if (!meta || !('contact' in meta) || !(meta.contact instanceof Object)) {
    return null;
  }

  let instagram: string | undefined = undefined;
  let phone: string | undefined = undefined;
  let web: string | undefined = undefined;
  let email: string | undefined = undefined;

  if ('instagram' in meta.contact && typeof (meta.contact.instagram) == 'string') instagram = meta.contact.instagram;
  if ('phone' in meta.contact && typeof (meta.contact.phone) == 'string') phone = meta.contact.phone;
  if ('web' in meta.contact && typeof (meta.contact.web) == 'string') web = meta.contact.web;
  if ('email' in meta.contact && typeof (meta.contact.email) == 'string') email = meta.contact.email;

  return (
    <InformationArea
      title={'문의'}
      icon={<PhoneAndCheckIcon height={22}/>}
    >
      <div className={'flex flex-col gap-1.5'}>
        {phone !== undefined &&
          <p><Link to={'tel://' + phone.replaceAll('-', '')}>{phone}</Link></p>
        }
        {instagram !== undefined &&
          <p><Link to={'https://instagram.com/' + instagram} target={'_blank'}>@{instagram}</Link></p>
        }
        {web !== undefined &&
          <p><Link to={web} target={'_blank'}>웹사이트</Link></p>
        }
        {email !== undefined &&
          <p><Link to={'mailto://' + email} target={'_blank'}>{email}</Link></p>
        }
      </div>
    </InformationArea>
  );
}

function PlaceMetaInterpreter(
  {meta, address}: { meta: object | undefined, address: string | undefined }
) {
  return (
    <>
      <ReservationInformation meta={meta}/>
      <OperationHoursInformation meta={meta}/>
      <OperationalInformation meta={meta} address={address}/>
      <InqueryInformation meta={meta}/>
    </>
  );
}

export default PlaceMetaInterpreter;
