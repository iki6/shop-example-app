import { takeLatest, call, put, all } from 'redux-saga/effects';

import {
  firestore,
  convertCollectionsSnapshotToMap,
} from '../../firebase/firebase.utils';

import { fetchCollectionSuccess, fetchCollectionFailure } from './shop.actions';

import ShopActionTypes from './shop.types';

export function* fetchCollectionAsync() {
  try {
    const collectionRef = firestore.collection('collections');
    const snapshot = yield collectionRef.get();
    const collectionsMap = yield call(
      convertCollectionsSnapshotToMap,
      snapshot,
    );
    yield put(fetchCollectionSuccess(collectionsMap));
  } catch (err) {
    yield put(fetchCollectionFailure(err.message));
  }
}

export function* fetchCollectionsStart() {
  yield takeLatest(
    ShopActionTypes.FETCH_COLLECTION_START,
    fetchCollectionAsync,
  );
}

export function* shopSagas() {
  yield all([call(fetchCollectionsStart)]);
}
