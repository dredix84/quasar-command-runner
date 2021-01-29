<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          Command Runner
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="200"
      :breakpoint="400"
    >
      <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
        <q-list padding>
          <q-item clickable v-ripple to="/">
            <q-item-section avatar>
              <q-icon name="ondemand_video"/>
            </q-item-section>

            <q-item-section>
              Dashboard
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/settings">
            <q-item-section avatar>
              <q-icon name="star"/>
            </q-item-section>

            <q-item-section>
              Settings
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/about">
            <q-item-section avatar>
              <q-icon name="info"/>
            </q-item-section>

            <q-item-section>
              About
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-img class="absolute-top" src="https://cdn.quasar.dev/img/material.png" style="height: 150px">
        <div class="absolute-bottom bg-transparent">
                    <q-avatar size="56px" class="q-mb-sm">
                      <img :src="logo">
                    </q-avatar>
          <div class="text-weight-bold">Command Runner</div>
          <div>{{ companyName }}</div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'


export default {
  name: 'MainLayout',
  components: {EssentialLink},
  data() {
    return {
      leftDrawerOpen: false
    }
  },
  computed: {
    companyName() {
      return this.$store.state.settings.companyName
    },
    logo() {
      return this.$store.state.settings.logo
    }
  }
}
</script>
