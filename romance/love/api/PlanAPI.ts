import type APITypes from "./APITypes.ts";
import type {FriendInformationType} from "./RelationshipAPI.ts";
import {PlanRole} from "../model/Plan";

type GetGeneralPlanRequest = APITypes & {
  plan: {
    uid: string;
    name: string;
    host_id: string;
    date: {
      polling: string | null;
      from: string | null;
      to: string | null;
    };
    members: Array<{
      uid: string;
      name: string;
      role: number;
    }>;
  }
}

type Plan = {
  uid: string;
  name: string;
  host_id: string;
  date_from: string | null;
  date_to: string | null;
  polling_date: string | null;
}

type ListMyPlansRequest = APITypes & {
  plans: Array<Plan>;
}

type GetVoteStatusRequest = APITypes & {
  poll: {
    pollingOpen: string;
    dateFrom: string;
    dateTo: string;
    voted: number;
    votes: Record<string, number>;
  }
}

type GetPlanActivitiesRequest = APITypes & {
  activities: Array<PlanActivity>
}

type PlanActivity = {
  uid: string;
  name: string;
  description: string;
  place_id: string | null;
  at_date: string;
  at_time: string;
  category: number;
}

type PlanMemberType = FriendInformationType & {
  role: PlanRole;
}

type GetMyVoteRequest = APITypes & {
  vote: string[];
}

export type {
  Plan,

  GetGeneralPlanRequest,
  GetVoteStatusRequest,
  GetPlanActivitiesRequest,
  GetMyVoteRequest,
  PlanMemberType,
  PlanActivity,
  ListMyPlansRequest
}
