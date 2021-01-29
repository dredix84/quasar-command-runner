<template>
  <q-page class="flex" :class="{'flex-center':(commands.length === 0)}">
    <div style="width:100%">
      <div>
        <div class="text-center" v-if="commands.length === 0">
          <p>Start by added an new command or executing a custom command</p>
          <q-btn color="primary" icon="add" label="Add Command" @click="handleShowNewCommandDialog"/>
        </div>

        <q-card flat bordered class="my-card q-mx-md q-my-md" v-else>
          <q-card-section>
            <div class="text-h6">
              My Commands
              <q-badge align="top">{{ commands.length }}</q-badge>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none" style="width: 100%">
            <q-list padding bordered class="rounded-borders">
              <q-expansion-item
                v-for="(command, cIndex) in commands"
                dense
                dense-toggle
                expand-separator
                :icon="command.icon.value"
                :label="command.title + (command.busy ? ' -- PROCESSING' : '')"
                :class="{busy: command.busy}"
                :key="command.id"
              >
                <q-card>
                  <q-card-section>
                    <div>
                      <q-btn
                        color="negative"
                        size="sm"
                        icon-right="delete"
                        @click="handleRemoveCommand(cIndex)"
                        class="q-mr-sm "
                        label="Delete"
                      >
                        <q-tooltip>
                          Remove <span class="text-bold">{{ command.title }}</span> command
                        </q-tooltip>
                      </q-btn>
                      <q-btn
                        color="warning"
                        size="sm"
                        icon-right="edit"
                        @click="handleShowEditCommandDialog(command)"
                        class="q-mr-sm "
                        label="Edit"
                      >
                        <q-tooltip>
                          Edit <span class="text-bold">{{ command.title }}</span> command
                        </q-tooltip>
                      </q-btn>
                      <q-btn
                        color="positive"
                        size="sm"
                        icon-right="send" label="Execute"
                        @click="execute(command)"
                      >
                        <q-tooltip>
                          Run <span class="text-bold">{{ command.title }}</span> command
                        </q-tooltip>
                      </q-btn>
                      <br/>

                      <q-chip square color="gray" text-color="black" class="q-my-sm">
                        <q-avatar icon="event" color="primary" text-color="white"/>
                        <span class="text-bold">Last Executed: </span><span
                        v-if="command.lastExecuted">{{ command.lastExecuted | moment("llll") }}</span>
                        <span v-else> Never executed</span>
                      </q-chip>
                      <br/>
                      <q-chip square color="gray" text-color="black">
                        <q-avatar icon="ondemand_video" color="primary" text-color="white"/>
                        <span class="text-bold">Command: </span>{{ computeCommandString(command) }}

                        <q-tooltip>
                          {{ command.command }}
                        </q-tooltip>
                      </q-chip>
                    </div>
                    <div>
                      <div class="row">
                        <div class="col-4 q-pr-sm q-mb-sm" v-for="variable in command.variables">
                          <q-input
                            outlined
                            :label="variable.name"
                            v-model="variable.default"
                            placeholder="Default variable value here"
                          />
                        </div>
                      </div>

                    </div>
                    <div>
                      <div v-if="command.lastError !== null">
                        <q-chip square>
                          <q-avatar icon="error" color="red" text-color="white"/>
                          <span class="text-bold">Last Error: </span>{{ command.lastError }}
                        </q-chip>
                      </div>
                      <pre style="max-height: 300px; overflow: scroll" v-if="command.lastResult">{{
                          command.lastResult
                        }}</pre>
                      <p v-else>Execute the command to see the result here</p>
                      <q-inner-loading :showing="command.busy">
                        <q-spinner-gears size="50px" color="primary"/>
                      </q-inner-loading>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </q-card-section>
        </q-card>

        <q-page-sticky position="bottom-right" :offset="[70, 18]">
          <q-fab color="purple" icon="keyboard_arrow_up" direction="up">
            <q-fab-action color="primary" @click="handleCustomExecuteShowDialog" icon="ondemand_video"
                          label="Custom Command"/>
            <q-fab-action color="secondary" @click="handleShowNewCommandDialog" icon="add" label="Add Command"/>
          </q-fab>
        </q-page-sticky>
      </div>
    </div>

    <!-- Custom command dialog -->
    <q-dialog v-model="customPrompt" persistent persistent transition-show="flip-down" transition-hide="flip-up">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Enter your custom command</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense v-model="customCommand" autofocus @keyup.enter="handleCustomExecuteEnter"
            label="Enter your custom command here"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup/>
          <q-btn flat label="Execute" v-close-popup @click="handleCustomExecuteEnter"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Result dialog -->
    <q-dialog v-model="resultDialog" persistent transition-show="flip-down" transition-hide="flip-up">
      <q-card>
        <q-toolbar>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
          </q-avatar>

          <q-toolbar-title><span class="text-weight-bold">Execution</span> Result</q-toolbar-title>

          <q-btn flat round dense icon="close" v-close-popup/>
        </q-toolbar>

        <q-card-section>
          <div v-if="resultCommand!== null">
            <q-chip class="glossy" square color="teal" text-color="white" icon="ondemand_video">
              <strong>Command: </strong> {{ resultCommand }}
            </q-chip>
          </div>
          <pre>{{ resultData }}</pre>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Create new command dialog -->
    <q-dialog v-model="newCommandShowDialog" persistent transition-show="flip-down" transition-hide="flip-up">
      <q-card style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">Create/Edit Command</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense v-model="newCommand.title" autofocus
            @keyup.enter="handleUserEnterNewCommand"
            label="Title"
            class="q-mb-sm"
          />
          <q-input
            dense v-model="newCommand.command"
            @keyup.enter="handleUserEnterNewCommand"
            label="Enter your new command here"
            class="q-mb-sm"
          />

          <q-chip square>
            <q-avatar :icon="newCommand.icon.value" color="red" text-color="white"/>
            {{ computeCommandString(newCommand) }}
          </q-chip>

          <q-select outlined v-model="newCommand.icon" :options="options.icons" class="q-mb-sm">
            <template v-slot:prepend>
              <q-icon :name="newCommand.icon.value"/>
            </template>
          </q-select>


          <q-list bordered class="rounded-borders" style="max-width: 600px">
            <q-item-label header>
              <div>
                Variables
                <q-btn color="positive" icon="add" size="xs" label="Add Variable" @click="handleAddCommandVariable"/>
              </div>
            </q-item-label>

            <q-item v-for="(variable, vIndex) in newCommand.variables" :key="'commandVar' + vIndex">
              <q-item-section avatar top>
                <q-icon name="keyboard" color="black" size="34px"/>
              </q-item-section>

              <q-item-section top>
                <q-item-label lines="1">
                  <q-input outlined :label="variable.name" v-model="variable.default"
                           placeholder="Default variable value here"/>
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <q-btn class="gt-xs" size="md" flat dense round icon="delete"
                         @click="handleRemoveCommandVariable(vIndex)"/>
                </div>
              </q-item-section>
            </q-item>

            <q-separator spaced/>

          </q-list>

        </q-card-section>

        <q-card-actions align="right" class="text-primary" v-if="newCommand.id === null">
          <q-btn flat label="Cancel" v-close-popup/>
          <q-btn flat label="Add Command" v-close-popup @click="handleUserEnterNewCommand"/>
        </q-card-actions>
        <q-card-actions align="right" class="text-primary" v-else>
          <q-btn flat label="Done" v-close-popup @click="handleEditCommandDialogClose"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import {app} from "electron";
import uuid from 'uuid-random';

const eApp = app;

export default {
  name: 'PageIndex',
  data() {
    return {
      exec: null,
      customPrompt: false,
      customCommand: 'ping 127.0.0.1',
      resultDialog: false,
      resultData: '',
      resultCommand: null,
      commands: [],
      newCommand: {
        id: null,
        title: 'Ping Localhost',
        command: 'ping',
        icon: {label: 'Execution', value: 'ondemand_video'},
        lastExecuted: null,
        lastResult: null,
        lastError: null,
        busy: false,
        variables: [],
      },
      virginNewCommand: {},
      newCommandShowDialog: false,
      options: {
        icons: [
          {label: 'Star', value: 'star'},
          {label: 'Execution', value: 'ondemand_video'},
          {label: 'Send', value: 'send'},
          {label: 'Alarm', value: 'alarm'},
          {label: 'History', value: 'history'},
        ]
      }
    }
  },
  methods: {
    handleRemoveCommand(index) {
      let self = this;
      this.$q.dialog({
        title: 'Confirm',
        message: `Are you sure you want to remove "${this.commands[index].title}"`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.$q.notify({
          message: 'Command removed.',
          icon: 'info',
          type: 'info',
        });
        this.commands.splice(index, 1);
        self.persistCommands();
      });
    },
    handleShowEditCommandDialog(command) {
      this.newCommand = command;
      this.newCommandShowDialog = true;
    },
    handleRemoveCommandVariable(index) {
      let name = this.newCommand.variables[index].name;
      name = ` [[${name}]]`;
      console.log({name})
      this.newCommand.command = this.newCommand.command.replace(name, '');
      this.newCommand.variables.splice(index, 1)
    },
    handleAddCommandVariable() {
      let variableName = this.randomString(6).toLowerCase()
      this.newCommand.variables.push({
        name: variableName,
        default: ''
      })
      this.newCommand.command += ` [[${variableName}]]`;
    },
    handleShowNewCommandDialog() {
      this.newCommand = JSON.parse(JSON.stringify(this.virginNewCommand));
      this.newCommandShowDialog = true;
    },
    handleUserEnterNewCommand() {
      if (this.validateCommand(this.newCommand.command)) {
        if (this.newCommand.id === null) {
          this.newCommand.id = uuid()
          this.commands.push(this.newCommand)
        }
        this.persistCommands()
        this.newCommandShowDialog = false;
        this.$q.notify({
          message: 'Command added.',
          icon: 'ondemand_video',
          type: 'positive',
        });
      }
    },
    handleEditCommandDialogClose() {
      let self = this;
      setTimeout(
        function () {
          self.persistCommands();
        },
        500
      );
    },
    persistCommands() {
      this.$q.localStorage.set('commands', this.commands);
    },
    handleCustomExecuteShowDialog() {
      this.customPrompt = true;
    },
    handleCustomExecuteEnter() {
      this.customPrompt = false;
      if (this.validateCommand(this.customCommand)) {
        this.execute(this.customCommand)
      }
    },
    /**
     * Used to valid that the user input is not empty
     */
    validateCommand(command) {
      if (command && command.trim().length > 0) {
        return true;
      }
      this.$q.notify({
        message: 'You did not enter a valid command',
        icon: 'announcement',
        type: 'negative',
      });
      return false;
    },
    test() {
      this.execute('dir');
    },
    nl2br(str, is_xhtml) {
      if (typeof str === 'undefined' || str === null) {
        return '';
      }
      var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
      return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    },
    showResultDialog(output, command) {
      this.resultData = output;
      this.resultDialog = true;
      if (command) {
        this.resultCommand = command
      }
    },
    computeCommandString(command) {
      if (typeof command === 'object') {
        let outCommand = command.command;
        if (command.variables.length > 0) {
          for (let x = 0; x < command.variables.length; x++) {
            let name = `[[${command.variables[x].name}]]`;
            outCommand = outCommand.replace(name, command.variables[x].default);
          }
        }
        return outCommand;
      }
      return command;
    },
    /**
     * Executes a command
     * @param command Command to execute
     * @param callback Callback if successful
     * @param errorCallback Callback if there is an error
     */
    execute(commandRaw, callback, errorCallback) {
      let command = '';
      if (typeof commandRaw === 'object') {
        command = this.computeCommandString(commandRaw);
        commandRaw.lastExecuted = new Date();
        commandRaw.lastResult = null;
        commandRaw.lastError = null;
        commandRaw.busy = true;
      } else {
        command = commandRaw;
      }
      console.info({command, commandRaw});

      let self = this;
      self.$q.loadingBar.start()
      self.$q.notify({
        spinner: true,
        message: 'Executing, please wait...',
        timeout: 1500,
        type: 'info',
      })

      let timeout = this.$store.state.settings.timeout;
      this.exec(command, {timeout}, (error, stdout, stderr) => {
        if (stdout) {
          if (typeof commandRaw === 'object') {
            commandRaw.lastResult = stdout;
            commandRaw.busy = false;
          }
          if (callback) {
            callback(stdout);
          } else if(this.$store.state.settings.showResultDialog === true){
            self.showResultDialog(stdout, command);
          }
        }
        self.$q.loadingBar.stop()
        if (stderr) {
          if (typeof commandRaw === 'object') {
            commandRaw.lastError = stderr;
            commandRaw.busy = false;
          }
          console.error(stderr);
          if (errorCallback !== undefined) {
            errorCallback(stderr)
          } else if (errorCallback === undefined) {
            self.$q.notify({
              message: stderr,
              icon: 'announcement',
              type: 'negative',
            });
          }
        }
      });
    },
    randomString(length) {
      let result = '';
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }
  },
  created() {
    this.exec = require('child_process').exec;


    let commands = this.$q.localStorage.getItem('commands')
    if (commands) {
      this.commands = commands;
    }

    this.virginNewCommand = JSON.parse(JSON.stringify(this.newCommand));

    this.$q.loadingBar.setDefaults({
      color: 'red',
      size: '10px',
      position: 'bottom'
    })
  }
}
</script>

<style>
.busy .q-item.q-item-type.row {
  background-color: antiquewhite;
}

.busy .q-item {
  background-color: antiquewhite;
}
</style>
