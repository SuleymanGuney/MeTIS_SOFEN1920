<template>
  <div>
    <b-form @submit="submitProject">
      <ProjectEdit :project="project" @update_project="update_project"/>
      <b-modal v-model="modalShow" title="Form not correctly filled in!">
        <p v-if="categoriesNotValidated == 'true'">Select one or more categories</p>
      </b-modal>
          <b-button class="submit-btn" type="submit" variant="success">Submit Project</b-button>
    </b-form>
  </div>
</template>

<script lang="ts" src="./projectCreationForm.ts">
</script>

<style scoped>

.submit-btn{
  width: 140px;
  float: right;
  clear: left;
}

</style>
