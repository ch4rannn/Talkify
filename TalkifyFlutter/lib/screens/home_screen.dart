import 'package:flutter/material.dart';
import '../theme.dart';
import 'chat_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TealMidnightTheme.background,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: AppBar(
          backgroundColor: TealMidnightTheme.surface,
          title: Row(
            children: [
              const Icon(Icons.forum_outlined, color: TealMidnightTheme.accent),
              const SizedBox(width: 10),
              const Text('Talkify'),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.person_add_outlined),
              onPressed: () {},
            ),
            IconButton(
              icon: const Icon(Icons.settings_outlined),
              onPressed: () {},
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: CircleAvatar(
                radius: 16,
                backgroundColor: TealMidnightTheme.surfaceHover,
                child: Text('C', style: TextStyle(color: TealMidnightTheme.accent, fontSize: 14)),
              ),
            )
          ],
        ),
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.only(top: 4.0),
              itemCount: 15,
              itemBuilder: (context, index) {
                return _buildContactItem(context, index);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      color: TealMidnightTheme.background,
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
      child: TextField(
        style: const TextStyle(color: TealMidnightTheme.textPrimary, fontSize: 14),
        decoration: InputDecoration(
          hintText: 'Search friends...',
          hintStyle: const TextStyle(color: TealMidnightTheme.textSecondary),
          filled: true,
          fillColor: TealMidnightTheme.surface,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(24.0), // Pill format
            borderSide: BorderSide.none,
          ),
        ),
      ),
    );
  }

  Widget _buildContactItem(BuildContext context, int index) {
    return InkWell(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (context) => const ChatScreen()));
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        child: Row(
          children: [
            // 48dp Avatar + Online Indicator
            Stack(
              children: [
                const CircleAvatar(
                  radius: 24,
                  backgroundColor: TealMidnightTheme.surfaceHover,
                  child: Icon(Icons.person, color: TealMidnightTheme.textSecondary),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      color: TealMidnightTheme.accent,
                      shape: BoxShape.circle,
                      border: Border.all(color: TealMidnightTheme.background, width: 2),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 14),
            // Name and Message preview
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Demo Contact',
                        style: TextStyle(
                            color: TealMidnightTheme.textPrimary,
                            fontWeight: FontWeight.bold,
                            fontSize: 16),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const Text(
                        '12:45 PM',
                        style: TextStyle(color: TealMidnightTheme.textSecondary, fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'This is a clean, no-line preview...',
                    style: TextStyle(color: TealMidnightTheme.textSecondary, fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
