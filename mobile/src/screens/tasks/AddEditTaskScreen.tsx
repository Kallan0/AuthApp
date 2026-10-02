import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { z } from 'zod';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { MotionPressable, MotionView } from '../../components/Motion';
import { colors } from '../../constants/colors';
import { useTaskStore } from '../../store/taskStore';
import { getErrorMessage } from '../../api/client';
import type { AppStackParamList } from '../../navigation/types';
import type { Priority } from '../../types/task';
import { taskSchema } from '../../utils/validation';

type Props = NativeStackScreenProps<AppStackParamList, 'AddEditTask'>;
type Form = z.infer<typeof taskSchema>;
type Picker = 'scheduledDate' | 'scheduledTime' | 'deadlineDate' | 'deadlineTime' | null;
export function AddEditTaskScreen({ navigation, route }: Props) {
  const id = route.params?.taskId;
  const existing = useTaskStore(state => state.tasks.find(item => item.id === id));
  const { createTask, updateTask } = useTaskStore();
  const now = new Date();
  const [scheduledAt, setScheduledAt] = useState(() => existing ? new Date(existing.scheduledAt) : now);
  const [deadline, setDeadline] = useState(() => existing ? new Date(existing.deadline) : new Date(now.getTime() + 3600000));
  const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'medium');
  const [picker, setPicker] = useState<Picker>(null);
  const [pickerValue, setPickerValue] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [requestError, setRequestError] = useState('');
  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: existing?.title ?? '', description: existing?.description ?? '', category: existing?.category ?? '' },
  });
  const applyPickerValue = (target: Exclude<Picker, null>, selected: Date) => {
    const current = new Date(target.startsWith('scheduled') ? scheduledAt : deadline);
    if (target.endsWith('Date')) current.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    else current.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    if (target.startsWith('scheduled')) setScheduledAt(current);
    else setDeadline(current);
    setRequestError('');
  };
  const openPicker = (target: Exclude<Picker, null>) => {
    const value = target.startsWith('scheduled') ? scheduledAt : deadline;
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: target.endsWith('Date') ? 'date' : 'time',
        onValueChange: (_, selected) => applyPickerValue(target, selected),
        onError: () => Alert.alert('Could not open the picker', 'Please try again.'),
      });
      return;
    }
    setPickerValue(new Date(value));
    setPicker(target);
  };
  const confirmPicker = () => {
    if (picker && pickerValue) applyPickerValue(picker, pickerValue);
    setPicker(null);
    setPickerValue(null);
  };
  const submit = handleSubmit(async values => {
    if (!Number.isFinite(scheduledAt.getTime()) || !Number.isFinite(deadline.getTime())) {
      setRequestError('Choose a valid date and time.');
      return;
    }
    if (deadline.getTime() < scheduledAt.getTime()) {
      setRequestError('Deadline must be on or after the scheduled time.');
      return;
    }
    setSaving(true); setRequestError('');
    try {
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category.trim() || null,
        scheduledAt: scheduledAt.toISOString(),
        deadline: deadline.toISOString(),
        priority,
      };
      if (id) await updateTask(id, payload);
      else await createTask(payload);
      navigation.goBack();
    } catch (error) { setRequestError(getErrorMessage(error)); }
    finally { setSaving(false); }
  });
  if (id && !existing) return <View style={styles.page}><Text style={styles.error}>Task could not be found.</Text></View>;
  return <MotionView style={styles.screen}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>TASK / {id ? 'EDIT' : 'NEW'}</Text>
    <Text style={styles.heading}>{id ? 'Edit task' : 'Create a task'}</Text>
    <View style={styles.panel}>
      <Controller control={control} name="title" render={({ field: { value, onChange, onBlur } }) => <AppInput label="Title" value={value} onChangeText={onChange} onBlur={onBlur} placeholder="What needs doing?" error={errors.title?.message} />} />
      <Controller control={control} name="description" render={({ field: { value, onChange, onBlur } }) => <AppInput label="Description" value={value} onChangeText={onChange} onBlur={onBlur} multiline style={styles.multiline} placeholder="Add details" error={errors.description?.message} />} />
      <Controller control={control} name="category" render={({ field: { value, onChange, onBlur } }) => <AppInput label="Category" value={value} onChangeText={onChange} onBlur={onBlur} placeholder="Optional" error={errors.category?.message} />} />
    </View>
    <View style={styles.panel}>
      <Text style={styles.sectionLabel}>PRIORITY</Text>
      <View style={styles.priorityRow}>
        {(['low', 'medium', 'high'] as const).map(item => <MotionPressable key={item} onPress={() => setPriority(item)} selected={priority === item} activeBackground={colors.blue} inactiveBackground={colors.canvas} style={[styles.priority, priority === item && styles.priorityActive]}><Text style={[styles.priorityText, priority === item && styles.priorityTextActive]}>{item.toUpperCase()}</Text></MotionPressable>)}
      </View>
    </View>
    <View style={styles.panel}>
      <Text style={styles.sectionLabel}>SCHEDULE</Text>
      <Text style={styles.fieldLabel}>START</Text>
      <View style={styles.dateRow}><MotionPressable onPress={() => openPicker('scheduledDate')} style={styles.dateButton}><Text style={styles.dateText}>{scheduledAt.toLocaleDateString()}</Text></MotionPressable><MotionPressable onPress={() => openPicker('scheduledTime')} style={styles.dateButton}><Text style={styles.dateText}>{scheduledAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text></MotionPressable></View>
      <Text style={styles.fieldLabel}>DEADLINE</Text>
      <View style={styles.dateRow}><MotionPressable onPress={() => openPicker('deadlineDate')} style={styles.dateButton}><Text style={styles.dateText}>{deadline.toLocaleDateString()}</Text></MotionPressable><MotionPressable onPress={() => openPicker('deadlineTime')} style={styles.dateButton}><Text style={styles.dateText}>{deadline.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text></MotionPressable></View>
    </View>
    {requestError ? <Text style={styles.error}>{requestError}</Text> : null}
    <AppButton title={saving ? 'SAVING...' : id ? 'SAVE CHANGES' : 'CREATE TASK'} onPress={submit} disabled={saving} />
    {picker && pickerValue ? <View style={styles.iosPicker}>
      <DateTimePicker value={pickerValue} mode={picker.endsWith('Date') ? 'date' : 'time'} display="spinner" onValueChange={(_, selected) => setPickerValue(selected)} />
      <View style={styles.pickerActions}>
        <AppButton title="CANCEL" variant="secondary" onPress={() => { setPicker(null); setPickerValue(null); }} style={styles.pickerAction} />
        <AppButton title="DONE" onPress={confirmPicker} style={styles.pickerAction} />
      </View>
    </View> : null}
  </ScrollView></MotionView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  page: { backgroundColor: colors.canvas, padding: 18, paddingBottom: 42, flexGrow: 1 },
  eyebrow: { color: colors.blue, fontFamily: 'monospace', fontSize: 11, letterSpacing: 1.2, marginTop: 8 },
  heading: { color: colors.ink, fontWeight: '800', fontSize: 29, marginTop: 8, marginBottom: 22 },
  panel: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 },
  multiline: { minHeight: 105, textAlignVertical: 'top' },
  sectionLabel: { color: colors.ink, fontFamily: 'monospace', fontWeight: '700', fontSize: 12, marginBottom: 15 },
  priorityRow: { flexDirection: 'row', gap: 7 },
  priority: { flex: 1, borderWidth: 1, borderColor: colors.border, paddingVertical: 13, alignItems: 'center', backgroundColor: colors.canvas },
  priorityActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  priorityText: { fontFamily: 'monospace', fontSize: 11, color: colors.ink, fontWeight: '700' },
  priorityTextActive: { color: colors.paper },
  fieldLabel: { color: colors.muted, fontFamily: 'monospace', fontSize: 10, marginBottom: 8 },
  dateRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  dateButton: { flex: 1, backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.border, padding: 12 },
  dateText: { color: colors.ink, fontSize: 15 },
  iosPicker: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 16 },
  pickerActions: { flexDirection: 'row', gap: 8 },
  pickerAction: { flex: 1 },
  error: { color: colors.red, marginBottom: 14 },
});
