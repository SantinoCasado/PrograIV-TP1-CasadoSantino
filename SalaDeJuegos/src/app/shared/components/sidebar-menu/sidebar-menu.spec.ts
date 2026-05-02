import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SidebarMenu } from './sidebar-menu';
import { GithubService } from '../../../core/services/github/github';

describe('SidebarMenu', () => {
  let component: SidebarMenu;
  let fixture: ComponentFixture<SidebarMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarMenu],
      providers: [
        {
          provide: GithubService,
          useValue: {
            getUser: () =>
              of({
                login: 'SantinoCasado',
                name: 'Santino Casado',
                avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
                html_url: 'https://github.com/SantinoCasado',
                bio: null,
                public_repos: 0,
                followers: 0,
                following: 0,
                location: null,
                company: null,
                blog: '',
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
