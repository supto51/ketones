import * as FoodsListState from '../foods/store/foods-list.reducer';
import { ActionReducerMap } from '@ngrx/store';

export interface AppState {
  foodsList: FoodsListState.FoodsState;
}

export const appReducer: ActionReducerMap<AppState> = {
  foodsList: FoodsListState.foodsListReducer,
};
