<template>
  <div>
    <v-container>
      <v-layout row>
        <v-flex
          xs12
          sm6
          offset-sm3
        >
          <v-layout
            row
            justify-center
          >
            <v-flex xs5>
              <div style="text-align: center">
                <v-btn
                  v-if="$store.getters.admin"
                  large
                  dark
                  color="#444645"
                  block
                  class="roundedCorners"
                  @click="$router.push('/tableEditor')"
                >
                  Legge til/fjerne bord
                </v-btn>
              </div>
            </v-flex>
          </v-layout>
          <v-layout
            row
            justify-center
          >
            <v-flex xs5>
              <div style="...">
                <v-btn
                  v-if="$store.getters.admin || $store.getters.employee"
                  large
                  dark
                  color="#444645"
                  block
                  class="roundedCorners"
                  @click="$router.push('/booking')"
                >
                  Bookingsystem
                </v-btn>
              </div>
            </v-flex>
          </v-layout>
          <v-layout
            row
            justify-center
          >
            <v-flex xs5>
              <div style="text-align: center">
                <v-btn
                  v-if="$store.getters.admin || $store.getters.employee"
                  large
                  dark
                  color="#444645"
                  block
                  class="roundedCorners"
                  @click="$router.push('/allreservations')"
                >
                  Oversikt over reservasjoner
                </v-btn>
              </div>
            </v-flex>
          </v-layout>
          <v-layout
            row
            justify-center
          >
            <v-flex xs5>
              <div style="text-align: center">
                <v-btn
                  v-if="$store.getters.admin"
                  large
                  dark
                  color="#444645"
                  block
                  class="roundedCorners"
                  @click="$router.push('/statistics')"
                >
                  Statistikk
                </v-btn>
              </div>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
      <v-layout
        v-if="user && user.customer"
        row
        wrap
      >
        <v-flex
          xs12
        >
          <customers-reservations />
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import CustomersReservations from '../Components/CustomersReservations'

export default {
  components: { CustomersReservations },
  middleware: ['router-check'],
  data () {
    return {
    }
  },
  computed: {
    user () {
      return this.$store.getters.user
    }
  }
}

</script>

<style scoped>
  .roundedCorners {
    height:70px;
    width: 250px;
    border-radius: 0px 18px 0px 18px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }
</style>
