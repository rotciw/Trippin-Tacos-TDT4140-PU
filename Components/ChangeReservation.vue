<template>
  <!-- Dialogen (popup) her er for endring av reservasjonen
  KOMPONENT FOR customerChangeReservation. Er ikke helt lik som i allreservations
    ENDRING AV RESERVASJON START -->
  <v-dialog
    v-model="dialog"
    max-width="600px"
  >
    <v-card>
      <v-card-title>
        <span class="headline">Endre reservasjon:</span>
      </v-card-title>
      <v-card-text>
        <v-container
          v-if="editedSelectedReservation && editedSelectedReservation.user"
          grid-list-md
        >
          <v-layout wrap>
            <!-- .user. på de man skal hente fra users databasen -->
            <v-flex
              xs12
              sm6
              md4
            >
              <v-text-field
                v-model="editedSelectedReservation.user.firstName"
                label="Fornavn"
              />
            </v-flex>
            <v-flex
              xs12
              sm6
              md4
            >
              <!-- Her hentes data fra editedSelectedReservation som er definert under.
              Disse henter fra users og reservations tabellene i databasen -->
              <v-text-field
                v-model="editedSelectedReservation.user.lastName"
                label="Etternavn"
              />
            </v-flex>
            <v-flex
              xs12
              sm6
              md4
            >
              <v-text-field
                v-model="editedSelectedReservation.user.mobile"
                label="Tlfnr"
              />
            </v-flex>
            <v-flex
              xs12
              sm6
              md4
            >
              <v-text-field
                v-model="editedSelectedReservation.user.email"
                label="Epost"
              />
            </v-flex>
            <v-flex
              xs12
              sm6
              md4
            >
              <v-text-field
                v-model="editedSelectedReservation.numberOfPersons"
                label="Antall Personer"
                min="1"
                type="number"
              />
            </v-flex>
            <v-flex
              xs12
              sm6
              md4
            >
              <v-text-field
                v-model="editedSelectedReservation.comments"
                label="Kommentarer"
              />
            </v-flex>
            <!-- Starttid -->
            <v-flex
              xs12
              sm6
              md4
            >
              <v-menu
                ref="startMenu"
                v-model="menu2"
                :close-on-content-click="false"
                :nudge-left="40"
                :return-value.sync="startTime"
                lazy
                transition="scale-transition"
                offset-x
                full-width
                max-width="250px"
                min-width="250px"
              >
                <v-text-field
                  slot="activator"
                  v-model="startTime"
                  color="green"
                  prepend-icon="access_time"
                  label="Starttid"
                  readonly
                />
                <v-time-picker
                  v-if="menu2"
                  v-model="startTime"
                  :allowed-hours="allowedHours"
                  :allowed-minutes="allowedMinutes"
                  color="green"
                  format="24hr"
                  full-width
                  :min="minStartTime"
                  :max="tomorrow"
                  @click:minute="$refs.startMenu.save(startTime); updateMinEndTime()"
                />
              </v-menu>
            </v-flex>
            <v-flex
              xs12
              sm6
              md4
            >
              <v-menu
                v-model="menu"
                color="green"
                :close-on-content-click="false"
                :nudge-right="40"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
              >
                <v-text-field
                  slot="activator"
                  v-model="date"
                  label="Dato"
                  color="green"
                  prepend-icon="event"
                  readonly
                />
                <v-date-picker
                  v-model="date"
                  color="green"
                  :min="minDate"
                  @input="menu = false"
                />
              </v-menu>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="red"
          flat
          @click="cancelReservation"
        >
          Avbestill bord
        </v-btn>
        <v-spacer />
        <v-btn
          color="red darken-1"
          flat
          @click="close"
        >
          Avbryt
        </v-btn>
        <v-btn
          color="blue darken-1"
          flat
          :loading="loading"
          @click="save"
        >
          Lagre
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- ENDRING AV RESERVASJON DIALOG SLUTT -->
</template>

<script>
import moment from 'moment'
import axios from 'axios'

export default {
  name: 'ChangeReservation',
  props: {
    dialogVisible: Boolean,
    reservation: {
      type: Object,
      default: function () {
        return {
          reservationID: '',
          tableID: '',
          uid: '',
          guestID: '',
          numberOfPersons: '',
          created: '',
          duration: '',
          comments: '',
          startTime: '',
          endTime: '',
          user: {
            firstName: '',
            lastName: '',
            mobile: '',
            email: ''
          }
        }
      }
    },
    user: Boolean
  },
  data () {
    return {
      // Hver reservasjon som tilsvarer databasen
      date: new Date().toISOString().substr(0, 10),
      menu: false,
      menu1: false,
      menu2: false,
      minEndTime: moment().format('H:mm'),
      endTime: '',
      startTime: '',
      numberOfPersons: '',
      tableAvailable: '',
      tomorrow: moment().endOf('day').format('H:mm'),
      dialog: this.dialogVisible,
      selectedReservation: this.reservation,
      editedSelectedReservation: this.reservation,
      now: moment().valueOf()
    }
  },
  computed: {
    minStartTime () {
      if (this.date === moment().add(1, 'day').toISOString().substr(0, 10)) {
        return moment(this.now + 86400000).format('H:mm')
      }
      else return '12:00'
    },
    minDate () {
      return moment().endOf('day').toISOString()
    },
    loading () {
      return this.$store.getters.loading
    }
  },
  watch: {
    // Hvis verdien ikke er null så kommer dialog
    dialogVisible (val) {
      console.log(val)
      this.dialog = this.dialogVisible
    },
    reservation (val) {
      if (val !== null) {
        this.dialog = true
        this.editedSelectedReservation = this.reservation
        console.log(this.editedSelectedReservation)
        this.startTime = moment(this.reservation.startTime).format('H:mm')
        this.date = moment(this.editedSelectedReservation.startTime).toISOString().substr(0, 10)
      }
    }
  },
  methods: {
    /* Regner ut lovlige valg for timer og minutter */
    allowedHours: v => (v >= 12 && v < 22),
    allowedMinutes: v => (v % 15 === 0),
    close () {
      this.dialog = false
      // Nytt reservasjonsobjekt for å ikke overskride elementet vi henter inn
      this.editedSelectedReservation = {
        reservationID: '',
        tableID: '',
        uid: '',
        guestID: '',
        numberOfPersons: '',
        created: '',
        duration: '',
        comments: '',
        startTime: '',
        endTime: '',
        user: {
          firstName: '',
          lastName: '',
          mobile: '',
          email: ''
        }
      }
      /* this.endTime = ''
      this.startTime = ''
      this.numberOfPersons = 0
      this.tableID = 0 */
      this.$store.commit('clearAvailability')
      this.$emit('dialogClosed')
    },
    save () {
      // Lagre nye endringer til reservasjonen
      this.requestTables()
    },
    cancelReservation () {
      // Avbestille reservasjon
      if (confirm('Er du sikker på at du vil avbestille reservasjonen?')) {
        axios.post('https://us-central1-pu30-5b0f9.cloudfunctions.net/sendCancellationEmail', { 'reservationID': this.editedSelectedReservation.reservationID, 'email': this.editedSelectedReservation.user.email, 'displayName': this.editedSelectedReservation.user.firstName, 'startTime': this.editedSelectedReservation.startTime })
        this.$store.dispatch('removeReservation', this.editedSelectedReservation)
        this.close()
      }
    },
    updateMinEndTime () {
      // Del av funksjonen som skal finne ut av sluttid ikke er før starttid
      this.minEndTime = this.startTime
      if (this.startTime > this.endTime) {
        this.endTime = this.startTime
      }
    },
    /*
    * checkCustomerTables henter tilgjengelige bord fra storen,
    * går igjennom de ledige bordene og finner det bordet med minst, men nok, kapasitet.
    * Hvis det er et ledig bord oppretter den reservasjonen. Hvis det ikke er noe ledig kommer feilmelding.
    * */
    checkCustomerTables () {
      const customerTables = this.$store.getters.customerRequestedTables
      let availableTable
      let mimimum = 999999
      for (let i = 0; i < customerTables.length; i++) {
        const table = customerTables[i]
        if (table) {
          if (Number(table.capacity) < mimimum && table.available === true) {
            availableTable = table
            mimimum = table.capacity
          }
        }
      }
      if (availableTable) {
        this.tableAvailable = availableTable
        this.editedSelectedReservation.tableID = availableTable.tableID
        this.editedSelectedReservation.startTime = this.startTimeUnix
        if (this.user) {
          this.editedSelectedReservation.uid = this.reservation.uid
          this.editedSelectedReservation.guestID = ''
          this.$controller.users.updateUser(this.editedSelectedReservation.user)
        }
        else if (this.editedSelectedReservation.uid.length > 0) {
          this.editedSelectedReservation.uid = this.reservation.uid
          this.editedSelectedReservation.guestID = ''
        }
        else {
          this.editedSelectedReservation.uid = ''
          this.editedSelectedReservation.guestID = this.reservation.guestID
          this.$controller.users.updateGuestUser(this.editedSelectedReservation.user)
        }
        this.editedSelectedReservation.endTime = moment(this.startTimeUnix).add(4, 'hours').valueOf()
        this.$store.commit('setLoading', false)
        this.$controller.reservations.updateReservation(this.editedSelectedReservation)
        if (this.user) this.$store.dispatch('mountUsersReservations', this.$store.getters.user)
        this.close()
      }
      else {
        this.$store.commit('setError', 'Prøv et annet tidspunkt eller for en mindre gruppe')
        this.$store.commit('setLoading', false)
      }
    },
    // Legger inn kravene fra kunden (dato, antall personer og starttid) i en spørring til storen, som finner alle bordene som matcher kravene.
    requestTables () {
      if (this.editedSelectedReservation.numberOfPersons > 0) {
        this.$store.commit('setLoading', true)
        this.$store.commit('clearError')
        this.startTimeUnix = moment(this.date + ' - ' + this.startTime, 'YYYY-MM-DD - H:mm').valueOf()
        this.$store.dispatch('checkCustomerRequestedTableWithReservation', { numberOfPersons: this.editedSelectedReservation.numberOfPersons, startTime: this.startTimeUnix, endTime: moment(this.startTimeUnix).add(4, 'hours').valueOf(), reservationID: this.editedSelectedReservation.reservationID })
        setTimeout(() => this.checkCustomerTables(), 3000)
      }
      else this.$store.commit('setError', 'Velg gyldig antall personer')
    },
    updateTable (table) {
      this.tableID = table
    }
  }
}
</script>

<style scoped>

</style>
