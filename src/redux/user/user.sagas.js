import { takeLatest, put, all, call } from 'redux-saga/effects';

import {
  googleProvider,
  auth,
  createUserProfileDocument,
  getCurrentUser,
} from '../../firebase/firebase.utils';
import UserActionTypes from './user.types';
import {
  signInSuccess,
  signInFailure,
  signOutSuccess,
  signOutFailure,
} from './user.actions';

function* getSnapshotFromUserAuth(userAuth) {
  try {
    const userRef = yield call(createUserProfileDocument, userAuth);
    const snapshot = yield userRef.get();
    yield put(signInSuccess({ id: snapshot.id, ...snapshot.data() }));
  } catch (err) {
    yield put(signInFailure(err));
  }
}

export function* signInWthGoogle() {
  try {
    const { user } = yield auth.signInWithPopup(googleProvider);
    yield getSnapshotFromUserAuth(user);
  } catch (err) {
    yield put(signInFailure(err));
  }
}

export function* signInWithEmail({ payload: { email, password } }) {
  try {
    const { user } = yield auth.signInWithEmailAndPassword(email, password);
    yield getSnapshotFromUserAuth(user);
  } catch (err) {
    yield put(signInFailure(err));
  }
}

export function* isUserAuthenticated() {
  try {
    const userAuth = yield getCurrentUser();
    if (!userAuth) return;

    yield getSnapshotFromUserAuth(userAuth);
  } catch (err) {
    yield put(signInFailure(err));
  }
}

export function* signOut() {
  try {
    yield auth.signOut();
    yield put(signOutSuccess());
  } catch (err) {
    yield put(signOutFailure(err));
  }
}

export function* onGoogleSignInStart() {
  yield takeLatest(UserActionTypes.GOOGLE_SIGN_IN_START, signInWthGoogle);
}

export function* onEmailSignInStart() {
  yield takeLatest(UserActionTypes.EMAIL_SIGN_IN_START, signInWithEmail);
}

export function* onCheckUserSession() {
  yield takeLatest(UserActionTypes.CHECK_USER_SESSION, isUserAuthenticated);
}

export function* onSignOutStart() {
  yield takeLatest(UserActionTypes.SING_OUT_START, signOut);
}

export function* userSagas() {
  yield all([
    call(onGoogleSignInStart),
    call(onEmailSignInStart),
    call(onCheckUserSession),
    call(onSignOutStart),
  ]);
}