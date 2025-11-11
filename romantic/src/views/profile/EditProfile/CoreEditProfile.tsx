import {useNavigate} from "react-router-dom";
import {ChevronLeftIcon} from "../../../assets/svgs/svgs.ts";
import {ImageUrlProcessor} from "../../../core/model/ImageUrlProcessor.ts";
import {useAppSelector} from "../../../core/hook/ReduxHooks.ts";

function CoreEditProfile() {
  const navigate = useNavigate();

  const profilePictureUrl = useAppSelector(state => state.userInfoReducer.profile_picture);

  function back() {
    navigate(-1);
  }

  return (
    <div className={'mx-5'}>
      <div className={'flex justify-between items-center -mx-5 px-5 py-4 border-b border-neutral-300'}>
        <button onClick={back}>
          <ChevronLeftIcon height={24}/>
        </button>
        <p className={'text-lg font-medium'}>프로필 수정</p>
        <p/>
      </div>
      <div>
        <div className={'my-3'}>
          <img
            src={ImageUrlProcessor(profilePictureUrl)}
            className={"rounded-full h-16 w-16"}
          />
        </div>
      </div>
    </div>
  );
}

export default CoreEditProfile;
