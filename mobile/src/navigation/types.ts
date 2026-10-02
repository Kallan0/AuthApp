export type AppStackParamList = {
  Home: undefined;
  AddEditTask: { taskId?: string } | undefined;
  TaskDetails: { taskId: string };
  Profile: undefined;
};
