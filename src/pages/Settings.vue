<template>
  <q-page padding>
    <q-card class="my-card">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Settings</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-mb-md">
          <div class="col">Company Name</div>
          <div class="col">
            <q-input
              v-model.number="companyName"
              filled
              label="Company Name"
            />
          </div>
          <div class="col"></div>
        </div>
        <div class="row q-mb-md">
          <div class="col">Company Logo</div>
          <div class="col-8">
            <q-input
              v-model.number="logo"
              filled
              type="url"
              label="Company Logo"
            />
          </div>
        </div>
        <div class="row q-mb-md">
          <div class="col">Execution Timeout (milliseconds)</div>
          <div class="col">
            <q-input
              v-model.number="timeout"
              type="number"
              filled
              step="500"
              label="Timout in milliseconds"
              min="0"
            />
          </div>
          <div class="col"></div>
        </div>
        <div class="row q-mb-md">
          <div class="col">Show result in model</div>
          <div class="col">
            No
            <q-toggle v-model="showResultDialog" color="green"/>
            Yes
          </div>
          <div class="col"></div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
export default {
  name: 'Settings',
  computed: {
    timeout: {
      get() {
        return this.$store.state.settings.timeout
      },
      set(val) {
        this.$store.commit('settings/updateExecutionTimeout', val)
      }
    },
    showResultDialog: {
      get() {
        return this.$store.state.settings.showResultDialog
      },
      set(val) {
        this.$store.commit('settings/updateShowResultDialog', val)
      }
    },
    companyName: {
      get() {
        return this.$store.state.settings.companyName
      },
      set(val) {
        this.$store.commit('settings/updateCompanyName', val)
      }
    },
    logo: {
      get() {
        return this.$store.state.settings.logo
      },
      set(val) {
        this.$store.commit('settings/updateLogo', val)
      }
    }
  }
}
</script>
