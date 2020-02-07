<template>
  <div id="app" class="small-container">
    <h1>Employees</h1>

    <employee-form @add:employee="addEmployee"/>
    <employee-table
      :employees="employees"
      @delete:employee="deleteEmployee"
      @edit:employee="editEmployee"
    />
  </div>
</template>

<script>
import EmployeeTable from "@/components/EmployeeTable.vue";
import EmployeeForm from "@/components/EmployeeForm.vue";

export default {
  name: "app",
  components: {
    EmployeeTable,
    EmployeeForm
  },
  data() {
    return {
      employees: []
    };
  },
  mounted() {
    this.getEmployees();
  },
  methods: {
    addEmployee(employee) {
      const lastId =
        this.employees.length > 0
          ? this.employees[this.employees.length - 1].id
          : 0;
      const id = lastId + 1;
      const newEmployee = { ...employee, id };

      this.employees = [...this.employees, newEmployee];
    },
    // deleteEmployee(id) {
    //   this.employees = this.employees.filter(employee => employee.id !== id);
    // },
    editEmployee(id, updatedEmployee) {
      this.employees = this.employees.map(employee =>
        employee.id === id ? updatedEmployee : employee
      );
    },
    async getEmployees() {
      try {
        const response = await fetch(
          "https://fw5zlnhsu3.execute-api.us-east-1.amazonaws.com/dev/employee"
        );
        const data = await response.json();
        this.employees = data["employees"];
      } catch (error) {
        // console.error(error);
      }
    },
    async deleteEmployee(id) {
      try {
        /* eslint-disable no-console */
        console.log("deleting");
        /* eslint-enable no-console */
        await fetch(
          `https://fw5zlnhsu3.execute-api.us-east-1.amazonaws.com/dev/employee/${id}`,
          {
            method: "DELETE"
          }
        );
        this.employees = this.employees.filter(employee => employee.id !== id);
      } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
      }
    }
  }
};
</script>

<style>
button {
  background: #009435;
  border: 1px solid #009435;
}

.small-container {
  max-width: 680px;
}
</style>