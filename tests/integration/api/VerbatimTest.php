<?php

namespace ErnestDefoe\Verbatim\Tests\integration\api;

use Flarum\Testing\integration\TestCase;
use PHPUnit\Framework\Attributes\Test;

/**
 * Verbatim is all frontend: its PHP only puts its script, styles and strings
 * into the forum's assets. These check that the script and styles arrive.
 */
class VerbatimTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('ernestdefoe-verbatim');
    }

    /** Render the forum from scratch, so no asset is left over from another run. */
    private function asset(string $name): string
    {
        foreach (glob($this->tmpDir().'/public/assets/forum*') as $file) {
            unlink($file);
        }

        $this->assertSame(200, $this->send($this->request('GET', '/'))->getStatusCode());

        $path = $this->tmpDir().'/public/assets/'.$name;
        $this->assertFileExists($path);

        return file_get_contents($path);
    }

    #[Test]
    public function the_forum_script_includes_verbatim()
    {
        $this->assertTrue(str_contains(str_replace('"', "'", $this->asset('forum.js')), "'ernestdefoe-verbatim'"), 'forum.js does not register ernestdefoe-verbatim');
    }

    #[Test]
    public function the_forum_styles_include_the_stale_marker()
    {
        $this->assertTrue(str_contains($this->asset('forum.css'), 'a.Verbatim-marker'), 'forum.css has no a.Verbatim-marker rule');
    }
}
