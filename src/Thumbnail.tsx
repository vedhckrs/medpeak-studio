import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {theme} from './brand/theme';
import {OrganArt} from './scenes/art/Organs';
import type {VideoProps} from './types';

/** 1280x720 thumbnail (or 1080x1920 Short cover): 2-4 big words + one lit organ. */
export const Thumbnail: React.FC<VideoProps> = ({video, shortId}) => {
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const pkg = shortId ? video.shorts?.find((s) => s.id === shortId)?.package ?? video.package : video.package;
  const text = pkg.thumbnail?.text ?? pkg.title;
  const organ = pkg.thumbnail?.organ ?? video.package.thumbnail?.organ ?? 'body';
  const u = Math.min(width, height) / 720;
  return (
    <AbsoluteFill style={{fontFamily: theme.font, background: `radial-gradient(ellipse at 70% 50%, #123e66, ${theme.bg} 70%)`, flexDirection: portrait ? 'column' : 'row', alignItems: 'center', padding: 40 * u}}>
      <div style={{flex: 1, fontSize: (portrait ? 120 : 108) * u, fontWeight: 900, lineHeight: 0.98, color: theme.white, letterSpacing: -2, textShadow: '0 6px 24px rgba(0,0,0,0.6)'}}>
        {text.split(' ').map((w, i) => (
          <span key={i} style={{color: i === text.split(' ').length - 1 ? theme.amber : theme.white}}>{w} </span>
        ))}
      </div>
      <div style={{width: (portrait ? 640 : 560) * u, height: (portrait ? 520 : 460) * u}}>
        <OrganArt organ={organ} t={1.6} level={0.9} />
      </div>
      <div style={{position: 'absolute', bottom: 22 * u, left: 40 * u, fontSize: 26 * u, fontWeight: 800, color: theme.teal}}>MedPeak Health</div>
    </AbsoluteFill>
  );
};
