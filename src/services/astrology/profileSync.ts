import { db } from '@/lib/db';
import { findCityLocation } from '@/lib/cities';
import { calculateFullChart } from './chart';

export interface SyncProfileParams {
  userId: string;
  name: string;
  birthDate?: string | null;
  birthTime?: string | null;
  city?: string | null;
  country?: string | null;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Infallible, centralized synchronizer between User records and BirthProfiles.
 * Resolves accurate coordinates, updates user & profile, and calculates the full astrological chart.
 */
export async function syncUserAndBirthProfile(params: SyncProfileParams) {
  const {
    userId,
    name,
    birthDate,
    birthTime = '12:00',
    city,
    country,
    timezone,
    latitude,
    longitude,
  } = params;

  // 1. Resolve geographic location and timezone accurately
  const location = findCityLocation(city, country, latitude, longitude, timezone);

  // 2. Find existing birth profile for this user
  let existingProfile = await db.birthProfile.findFirst({
    where: {
      OR: [
        { createdBy: userId },
        { name: name.trim() },
      ],
    },
  });

  const effectiveBirthDate = birthDate || existingProfile?.birthDate;
  const effectiveBirthTime = birthTime || existingProfile?.birthTime || '12:00';
  const effectiveCity = city || location.city;
  const effectiveCountry = country || location.country;
  const effectiveLat = location.lat;
  const effectiveLng = location.lng;
  const effectiveTz = location.tz;

  if (!effectiveBirthDate) {
    return { profile: existingProfile, chartData: null };
  }

  // 3. Calculate full astrological chart with high astronomical precision
  const chartData = await calculateFullChart({
    birthDate: effectiveBirthDate,
    birthTime: effectiveBirthTime,
    timeUnknown: false,
    city: effectiveCity,
    country: effectiveCountry,
    latitude: effectiveLat,
    longitude: effectiveLng,
    timezone: effectiveTz,
  });

  // 4. Update or create BirthProfile and replace child records in atomic transaction
  const syncedProfile = await db.$transaction(async (tx) => {
    let profileId: string;

    if (existingProfile) {
      profileId = existingProfile.id;
      await tx.birthProfile.update({
        where: { id: profileId },
        data: {
          name: name.trim(),
          birthDate: effectiveBirthDate,
          birthTime: effectiveBirthTime,
          city: effectiveCity,
          country: effectiveCountry,
          latitude: effectiveLat,
          longitude: effectiveLng,
          timezone: effectiveTz,
          isCalculated: true,
        },
      });

      // Clear existing records before recreation
      await tx.planetaryPosition.deleteMany({ where: { birthProfileId: profileId } });
      await tx.house.deleteMany({ where: { birthProfileId: profileId } });
      await tx.chartPoint.deleteMany({ where: { birthProfileId: profileId } });
      await tx.aspect.deleteMany({ where: { birthProfileId: profileId } });
    } else {
      const newProfile = await tx.birthProfile.create({
        data: {
          name: name.trim(),
          birthDate: effectiveBirthDate,
          birthTime: effectiveBirthTime,
          city: effectiveCity,
          country: effectiveCountry,
          latitude: effectiveLat,
          longitude: effectiveLng,
          timezone: effectiveTz,
          createdBy: userId,
          isCalculated: true,
        },
      });
      profileId = newProfile.id;
    }

    // Insert planetary positions
    if (chartData.planetaryPositions?.length) {
      await tx.planetaryPosition.createMany({
        data: chartData.planetaryPositions.map((pos) => ({
          birthProfileId: profileId,
          body: pos.body,
          sign: pos.sign,
          degree: pos.degree,
          minute: pos.minute,
          retrograde: pos.retrograde || false,
          house: pos.house || 1,
        })),
      });
    }

    // Insert houses
    if (chartData.houses?.length) {
      await tx.house.createMany({
        data: chartData.houses.map((h) => ({
          birthProfileId: profileId,
          houseNumber: h.houseNumber,
          sign: h.sign,
          degree: h.degree,
          minute: h.minute,
        })),
      });
    }

    // Insert chart points
    if (chartData.chartPoints?.length) {
      await tx.chartPoint.createMany({
        data: chartData.chartPoints.map((cp) => ({
          birthProfileId: profileId,
          point: cp.point,
          sign: cp.sign,
          degree: cp.degree,
          minute: cp.minute,
          house: cp.house || 1,
        })),
      });
    }

    // Insert aspects
    if (chartData.aspects?.length) {
      await tx.aspect.createMany({
        data: chartData.aspects.map((asp) => ({
          birthProfileId: profileId,
          body1: asp.body1,
          body2: asp.body2,
          type: asp.type,
          angle: asp.angle,
          orb: asp.orb,
          degree1: asp.degree1,
          degree2: asp.degree2,
        })),
      });
    }

    // Also update User record location data to ensure 100% consistency
    await tx.user.update({
      where: { id: userId },
      data: {
        city: effectiveCity,
        country: effectiveCountry,
        timezone: effectiveTz,
      },
    });

    return tx.birthProfile.findUnique({
      where: { id: profileId },
      include: {
        planetaryPositions: true,
        houses: true,
        chartPoints: true,
        aspects: true,
      },
    });
  });

  return { profile: syncedProfile, chartData };
}
