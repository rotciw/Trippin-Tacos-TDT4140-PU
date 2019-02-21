import * as firebase from 'firebase'

export const state = () => ({
  user: null,
  loading: false,
  error: null
})

// Mutations are functions that the store uses to set its atrributes
export const mutations = {
  setLoading (state, payload) {
    state.loading = payload
  },
  setUser (state, payload) {
    state.user = payload
  },
  setError (state, payload) {
    state.error = payload
  },
  clearError (state, payload) {
    state.error = null
  },
  clearState (state) {
    state.user = null
    state.loading = false
    state.error = null
  }
}
// Actions are actions ran by the store. They are callable with this.$store.dispatch('actionnavn')
export const actions = {
  // Autosigns in the user if the session is still valid
  autoSignIn ({ commit }, payload) {
    firebase.firestore().collection('users').doc(payload.uid).get()
      .then(user => {
        user = user.data()
        commit('setUser', user)
      })
      .catch(error => {
        console.log(error)
      })
  },
  clearError ({ commit }) {
    commit('clearError')
  },
  clearState ({ commit }) {
    commit('clearState')
  },
  signUserUp ({ commit }, payload) {
  },
  // Signs in the user and gets his info from the database
  signUserIn ({ commit }, payload) {
    commit('setLoading', true)
    commit('clearError')
    firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
      .then(user => {
        commit('setLoading', false)
        firebase.firestore().collection('users').doc(user.user.uid).get()
          .then(user => {
            user = user.data()
            commit('setUser', user)
          })
      })
      .catch(error => {
        commit('setLoading', false)
        commit('setError', error)
        console.log(error)
      })
  },
  signUserOut ({ commit }) {
    commit('setLoading', true)
    firebase.auth().signOut()
      .then(user => {
        commit('clearState')
      })
      // Sign-out successful.
      .catch(error => {
        commit('setLoading', false)
        commit('setError', error)
        console.log(error)
      })
  } }
// Getters are like the one used in Java to access the stores attributes.
export const getters = {
  error (state) {
    return state.error
  },
  user (state) {
    return state.user
  }
}
