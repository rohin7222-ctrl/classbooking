import { NextRequest, NextResponse } from 'next/server';
import { calculateAttendanceMetrics, SEMESTER_END_DATE, DEFAULT_TARGET_PERCENTAGE } from '@/utils/attendanceCalculator';
import { TIMETABLE_DATA, SECTION_OPTIONS } from '@/data/timetableData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'IV_ECE_B';
    const targetDate = searchParams.get('targetDate') || SEMESTER_END_DATE;
    const odDays = parseInt(searchParams.get('odDays') || '0', 10);
    const sickDays = parseInt(searchParams.get('sickDays') || '0', 10);
    const simulation = { odDays, sickDays };

    if (!TIMETABLE_DATA[section]) {
      return NextResponse.json(
        { 
          error: `Section '${section}' not found. Available sections: ${Object.keys(TIMETABLE_DATA).join(', ')}`,
          availableSections: SECTION_OPTIONS
        },
        { status: 400 }
      );
    }

    const result = calculateAttendanceMetrics(section, targetDate, {}, DEFAULT_TARGET_PERCENTAGE, simulation);
    return NextResponse.json({
      success: true,
      availableSections: SECTION_OPTIONS,
      data: result
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('Error in predict GET:', err);
    return NextResponse.json({ error: message, stack }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const section = body.section || 'IV_ECE_B';
    const targetDate = body.targetDate || SEMESTER_END_DATE;
    const userPercentages = body.userPercentages || {};
    const targetPercentage = Number(body.targetPercentage) || DEFAULT_TARGET_PERCENTAGE;
    const simulation = body.simulation || { odDays: 0, sickDays: 0 };

    if (!TIMETABLE_DATA[section]) {
      return NextResponse.json(
        { 
          error: `Section '${section}' not found. Available sections: ${Object.keys(TIMETABLE_DATA).join(', ')}`,
          availableSections: SECTION_OPTIONS
        },
        { status: 400 }
      );
    }

    const result = calculateAttendanceMetrics(section, targetDate, userPercentages, targetPercentage, simulation);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid request payload';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
