import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { toast } from 'sonner';
import { handleError } from '../utils/error';
import type { CrewPayroll, PayrollEntry } from '../types';

export function usePayroll() {
  const crews = useLiveQuery(() => db.payroll.toArray());

  const addCrew = async (crew: Omit<CrewPayroll, 'crewId'>) => {
    try {
      await db.payroll.add(crew);
      toast.success('Crew added successfully');
    } catch (error) {
      const message = handleError(error);
      toast.error(`Failed to add crew: ${message}`);
      throw error;
    }
  };

  const updateCrew = async (crewId: string, updates: Partial<CrewPayroll>) => {
    try {
      await db.payroll.update(crewId, updates);
      toast.success('Crew updated successfully');
    } catch (error) {
      const message = handleError(error);
      toast.error(`Failed to update crew: ${message}`);
      throw error;
    }
  };

  const deleteCrew = async (crewId: string) => {
    await db.payroll.delete(crewId);
  };

  const updateEmployeeEntries = async (
    crewId: string,
    employeeId: string,
    entries: PayrollEntry[]
  ) => {
    const crew = await db.payroll.get(crewId);
    if (crew) {
      const updatedEmployees = crew.employees.map((emp) =>
        emp.employeeId === employeeId ? { ...emp, entries } : emp
      );
      await db.payroll.update(crewId, { employees: updatedEmployees });
    }
  };

  return {
    crews: crews || [],
    addCrew,
    updateCrew,
    deleteCrew,
    updateEmployeeEntries,
    isLoading: crews === undefined,
  };
}