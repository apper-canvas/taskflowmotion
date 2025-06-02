const { ApperClient } = window.ApperSDK;

class TaskService {
  constructor() {
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'task40';
    this.fields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 
      'ModifiedOn', 'ModifiedBy', 'title', 'description', 
      'due_date', 'priority', 'status', 'project'
    ];
    this.updateableFields = [
      'Name', 'Tags', 'Owner', 'title', 'description', 
      'due_date', 'priority', 'status', 'project'
    ];
  }

  async fetchTasks(params = {}) {
    try {
      const queryParams = {
        fields: this.fields,
        ...params
      };

      const response = await this.apperClient.fetchRecords(this.tableName, queryParams);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  async getTaskById(taskId, params = {}) {
    try {
      const queryParams = {
        fields: this.fields,
        ...params
      };

      const response = await this.apperClient.getRecordById(this.tableName, taskId, queryParams);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching task with ID ${taskId}:`, error);
      throw error;
    }
  }

  async createTask(taskData) {
    try {
      // Filter to only include updateable fields and format data properly
      const filteredData = {};
      this.updateableFields.forEach(field => {
        if (taskData[field] !== undefined) {
          // Format data according to field type requirements
          if (field === 'due_date' && taskData[field]) {
            // Ensure date is in YYYY-MM-DD format
            filteredData[field] = taskData[field];
          } else if (field === 'Tags' && Array.isArray(taskData[field])) {
            // Convert array to comma-separated string
            filteredData[field] = taskData[field].join(',');
          } else {
            filteredData[field] = taskData[field];
          }
        }
      });

      const params = {
        records: [filteredData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        }
      }
      
      throw new Error("Failed to create task");
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async updateTask(taskId, taskData) {
    try {
      // Filter to only include updateable fields plus ID
      const filteredData = { Id: taskId };
      this.updateableFields.forEach(field => {
        if (taskData[field] !== undefined) {
          // Format data according to field type requirements
          if (field === 'due_date' && taskData[field]) {
            // Ensure date is in YYYY-MM-DD format
            filteredData[field] = taskData[field];
          } else if (field === 'Tags' && Array.isArray(taskData[field])) {
            // Convert array to comma-separated string
            filteredData[field] = taskData[field].join(',');
          } else {
            filteredData[field] = taskData[field];
          }
        }
      });

      const params = {
        records: [filteredData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        if (successfulUpdates.length > 0) {
          return successfulUpdates[0].data;
        }
      }
      
      throw new Error("Failed to update task");
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  async deleteTask(taskId) {
    try {
      const params = {
        RecordIds: [taskId]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  async getTasksByProject(projectId, params = {}) {
    try {
      const queryParams = {
        fields: this.fields,
        where: [
          {
            fieldName: "project",
            operator: "EqualTo",
            values: [projectId]
          }
        ],
        ...params
      };

      return await this.fetchTasks(queryParams);
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);
      throw error;
    }
  }

  async getTasksByStatus(status, params = {}) {
    try {
      const queryParams = {
        fields: this.fields,
        where: [
          {
            fieldName: "status",
            operator: "ExactMatch",
            values: [status]
          }
        ],
        ...params
      };

      return await this.fetchTasks(queryParams);
    } catch (error) {
      console.error(`Error fetching tasks with status ${status}:`, error);
      throw error;
    }
  }

  async getTasksByPriority(priority, params = {}) {
    try {
      const queryParams = {
        fields: this.fields,
        where: [
          {
            fieldName: "priority",
            operator: "ExactMatch",
            values: [priority]
          }
        ],
        ...params
      };

      return await this.fetchTasks(queryParams);
    } catch (error) {
      console.error(`Error fetching tasks with priority ${priority}:`, error);
      throw error;
    }
  }

  async searchTasks(searchTerm, params = {}) {
    try {
      const queryParams = {
        fields: this.fields,
        whereGroups: [
          {
            operator: "OR",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "title",
                    operator: "Contains",
                    values: [searchTerm]
                  }
                ],
                operator: ""
              },
              {
                conditions: [
                  {
                    fieldName: "description",
                    operator: "Contains",
                    values: [searchTerm]
                  }
                ],
                operator: ""
              }
            ]
          }
        ],
        ...params
      };

      return await this.fetchTasks(queryParams);
    } catch (error) {
      console.error("Error searching tasks:", error);
      throw error;
    }
  }

  async getOverdueTasks(params = {}) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const queryParams = {
        fields: this.fields,
        whereGroups: [
          {
            operator: "AND",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "due_date",
                    operator: "LessThan",
                    values: [today]
                  }
                ],
                operator: ""
              },
              {
                conditions: [
                  {
                    fieldName: "status",
                    operator: "NotEqualTo",
                    values: ["completed"]
                  }
                ],
                operator: ""
              }
            ]
          }
        ],
        ...params
      };

      return await this.fetchTasks(queryParams);
    } catch (error) {
      console.error("Error fetching overdue tasks:", error);
      throw error;
    }
  }

  async getTodayTasks(params = {}) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const queryParams = {
        fields: this.fields,
        where: [
          {
            fieldName: "due_date",
            operator: "ExactMatch",
            values: [today]
          }
        ],
        ...params
      };

      return await this.fetchTasks(queryParams);
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
      throw error;
    }
  }
}

export default new TaskService();